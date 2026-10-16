
import {
  uid, now, today, date, fail, positive, nonnegative, moneyTax
} from './utils.js';
import { one, all, run, transaction } from './db.js';
import { account, checkOwnRecord } from './companies.js';
import { postVoucher } from './ledger.js';

const DR = (a, value) => ({
  account_id: a,
  debit_paise: value,
  credit_paise: 0
});

const CR = (a, value) => ({
  account_id: a,
  debit_paise: 0,
  credit_paise: value
});

function add(lines, acct, amount, direction) {
  if (amount > 0) {
    lines.push(direction === 'DR' ? DR(acct, amount) : CR(acct, amount));
  }
}

function companyGstType(db, companyId) {
  const settings = one(
    db,
    'SELECT gst_type FROM company_settings WHERE company_id = ?',
    companyId
  );

  return settings?.gst_type || 'REGULAR';
}

export function stockQuantity(db, companyId, productId) {
  return one(
    db,
    `SELECT COALESCE(SUM(qty_remaining), 0) qty
     FROM stock_layers
     WHERE company_id = ? AND product_id = ?`,
    companyId,
    productId
  ).qty;
}

export function consumeFIFO(db, companyId, productId, qty) {
  const layers = all(
    db,
    `SELECT id, qty_remaining, unit_cost_paise
     FROM stock_layers
     WHERE company_id = ? AND product_id = ? AND qty_remaining > 0
     ORDER BY created_at, id`,
    companyId,
    productId
  );

  let need = qty;
  let cost = 0;

  for (const layer of layers) {
    const take = Math.min(need, layer.qty_remaining);
    if (!take) continue;

    run(
      db,
      'UPDATE stock_layers SET qty_remaining = qty_remaining - ? WHERE id = ?',
      take,
      layer.id
    );

    cost += take * layer.unit_cost_paise;
    need -= take;

    if (!need) break;
  }

  if (need) fail('Not enough available stock for this sale');

  return cost;
}

export function issueInvoice(db, companyId, userId, body) {
  return transaction(db, () => {
    const kind = body.kind;

    if (body.idempotency_key) {
      const previous = one(
        db,
        `SELECT id FROM vouchers
         WHERE company_id = ? AND idempotency_key = ?`,
        companyId,
        body.idempotency_key
      );

      if (previous) {
        const existing = one(
          db,
          'SELECT * FROM invoices WHERE voucher_id = ?',
          previous.id
        );

        if (existing) {
          return {
            id: existing.id,
            number: existing.number,
            total_paise: existing.total_paise,
            reused: true
          };
        }

        fail('Idempotency key already used for another voucher', 409);
      }
    }

    if (!['SALE', 'PURCHASE'].includes(kind)) {
      fail('Invoice kind must be SALE or PURCHASE');
    }

    const sale = kind === 'SALE';
    const registrationType = companyGstType(db, companyId);
    const regularRegistration = registrationType === 'REGULAR';
    const d = date(body.date || today());

    const party = checkOwnRecord(
      db,
      'contacts',
      body.contact_id,
      companyId
    );

    if (party.kind !== (sale ? 'CUSTOMER' : 'SUPPLIER')) {
      fail('Wrong contact kind');
    }

    const company = one(
      db,
      'SELECT * FROM companies WHERE id = ?',
      companyId
    );

    const partyState = party.state_code || company.state_code;
    const interstate = partyState !== company.state_code;

    if (!Array.isArray(body.items) ||
        !body.items.length ||
        body.items.length > 100) {
      fail('Add 1-100 invoice items');
    }

    let subtotal = 0;
    let gstTotal = 0;
    let cogs = 0;

    const enriched = [];
    const lines = [];

    for (const item of body.items) {
      const product = checkOwnRecord(
        db,
        'products',
        item.product_id,
        companyId
      );

      const qty = positive(item.qty, 'quantity', 100000);
      const unit = nonnegative(
        item.unit_paise ??
          (sale ? product.sale_price_paise : product.cost_price_paise),
        'unit price'
      );

      const gross = qty * unit;
      if (!Number.isSafeInteger(gross)) fail('Invoice amount too large');

      const discount = nonnegative(item.discount_paise ?? 0, 'discount');
      if (discount > gross) fail('Discount cannot exceed item value');

      const taxable = gross - discount;

      // Sellers under UNREGISTERED or COMPOSITION status do not
      // charge GST separately on sales in this basic invoice workflow.
      // Supplier GST on purchase invoices may still exist.
      const rate = sale && !regularRegistration
        ? 0
        : product.gst_bps;

      const tax = moneyTax(taxable, rate);
      const cgst = interstate ? 0 : Math.floor(tax / 2);
      const sgst = interstate ? 0 : tax - cgst;
      const igst = interstate ? tax : 0;

      subtotal += taxable;
      gstTotal += tax;

      const unitCost = sale
        ? consumeFIFO(db, companyId, product.id, qty)
        : unit;

      if (sale) cogs += unitCost;

      enriched.push({
        product_id: product.id,
        qty,
        unit_paise: unit,
        discount_paise: discount,
        taxable_paise: taxable,
        gst_bps: rate,
        cgst_paise: cgst,
        sgst_paise: sgst,
        igst_paise: igst,
        total_paise: taxable + tax,
        cogs_paise: sale ? unitCost : 0
      });
    }

    const total = subtotal + gstTotal;

    if (!Number.isSafeInteger(total) || total <= 0) {
      fail('Invoice total invalid');
    }

    const paid = nonnegative(body.paid_paise ?? 0, 'initial payment');
    if (paid > total) fail('Initial payment cannot exceed invoice total');

    const method = body.payment_method === 'BANK' ? 'BANK' : 'CASH';
    const cashOrBank = account(
      db,
      companyId,
      method === 'BANK' ? '1010' : '1000'
    );

    if (sale) {
      add(lines, cashOrBank, paid, 'DR');
      add(lines, account(db, companyId, '1100'), total - paid, 'DR');
      add(lines, account(db, companyId, '4000'), subtotal, 'CR');

      add(
        lines,
        account(db, companyId, '2100'),
        enriched.reduce((sum, item) => sum + item.cgst_paise, 0),
        'CR'
      );
      add(
        lines,
        account(db, companyId, '2110'),
        enriched.reduce((sum, item) => sum + item.sgst_paise, 0),
        'CR'
      );
      add(
        lines,
        account(db, companyId, '2120'),
        enriched.reduce((sum, item) => sum + item.igst_paise, 0),
        'CR'
      );

      add(lines, account(db, companyId, '5000'), cogs, 'DR');
      add(lines, account(db, companyId, '1200'), cogs, 'CR');
    } else {
      const purchaseTax = enriched.reduce(
        (sum, item) =>
          sum + item.cgst_paise + item.sgst_paise + item.igst_paise,
        0
      );

      if (regularRegistration) {
        add(lines, account(db, companyId, '1200'), subtotal, 'DR');
        add(
          lines,
          account(db, companyId, '1300'),
          enriched.reduce((sum, item) => sum + item.cgst_paise, 0),
          'DR'
        );
        add(
          lines,
          account(db, companyId, '1310'),
          enriched.reduce((sum, item) => sum + item.sgst_paise, 0),
          'DR'
        );
        add(
          lines,
          account(db, companyId, '1320'),
          enriched.reduce((sum, item) => sum + item.igst_paise, 0),
          'DR'
        );
      } else {
        // For non-regular registration, supplier GST is treated
        // as part of inventory cost rather than input-tax credit.
        add(lines, account(db, companyId, '1200'), subtotal + purchaseTax, 'DR');
      }

      add(lines, cashOrBank, paid, 'CR');
      add(lines, account(db, companyId, '2000'), total - paid, 'CR');
    }

    const prefix = sale ? 'S' : 'P';
    const count = one(
      db,
      'SELECT COUNT(*) count FROM invoices WHERE company_id = ? AND kind = ?',
      companyId,
      kind
    ).count;

    const number = `${prefix}-${String(count + 1).padStart(5, '0')}`;

    const voucher = postVoucher(db, {
      companyId,
      userId,
      kind,
      reference: number,
      dateValue: d,
      memo: `${kind} invoice ${number}`,
      lines,
      idempotencyKey: body.idempotency_key || null
    });

    if (voucher.reused) {
      const existing = one(
        db,
        'SELECT * FROM invoices WHERE voucher_id = ?',
        voucher.id
      );

      if (!existing) fail('Duplicate request still processing', 409);

      return {
        id: existing.id,
        number: existing.number,
        total_paise: existing.total_paise,
        reused: true
      };
    }

    const invId = uid();

    run(
      db,
      'INSERT INTO invoices VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      invId,
      companyId,
      kind,
      number,
      d,
      party.id,
      partyState,
      subtotal,
      gstTotal,
      total,
      voucher.id,
      now()
    );

    for (const item of enriched) {
      run(
        db,
        'INSERT INTO invoice_items VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
        uid(),
        invId,
        item.product_id,
        item.qty,
        item.unit_paise,
        item.discount_paise,
        item.taxable_paise,
        item.gst_bps,
        item.cgst_paise,
        item.sgst_paise,
        item.igst_paise,
        item.total_paise,
        item.cogs_paise
      );

      if (!sale) {
        const inventoryCost = item.taxable_paise +
          (regularRegistration
            ? 0
            : item.cgst_paise + item.sgst_paise + item.igst_paise);

        const baseCost = Math.floor(inventoryCost / item.qty);
        const extraUnits = inventoryCost - baseCost * item.qty;

        for (const [count, cost] of [
          [extraUnits, baseCost + 1],
          [item.qty - extraUnits, baseCost]
        ]) {
          if (count > 0) {
            run(
              db,
              'INSERT INTO stock_layers VALUES (?,?,?,?,?,?,?,?)',
              uid(),
              companyId,
              item.product_id,
              voucher.id,
              count,
              count,
              cost,
              now()
            );
          }
        }
      }

      run(
        db,
        'INSERT INTO stock_moves VALUES (?,?,?,?,?,?,?)',
        uid(),
        companyId,
        item.product_id,
        voucher.id,
        sale ? -item.qty : item.qty,
        sale
          ? item.cogs_paise
          : item.taxable_paise +
            (!regularRegistration
              ? item.cgst_paise + item.sgst_paise + item.igst_paise
              : 0),
        d
      );
    }

    if (paid) {
      run(
        db,
        'INSERT INTO payments VALUES (?,?,?,?,?,?,?,?)',
        uid(),
        companyId,
        invId,
        voucher.id,
        paid,
        method,
        d,
        now()
      );
    }

    return {
      id: invId,
      number,
      subtotal_paise: subtotal,
      gst_paise: gstTotal,
      total_paise: total,
      paid_paise: paid,
      outstanding_paise: total - paid
    };
  });
}

export function receivePayment(db, companyId, userId, invoiceId, body) {
  return transaction(db, () => {
    const inv = checkOwnRecord(db, 'invoices', invoiceId, companyId);

    if (body.idempotency_key) {
      const previous = one(
        db,
        `SELECT id FROM vouchers
         WHERE company_id = ? AND idempotency_key = ?`,
        companyId,
        body.idempotency_key
      );

      if (previous) {
        const prior = one(
          db,
          'SELECT * FROM payments WHERE voucher_id = ?',
          previous.id
        );

        if (prior) {
          return {
            id: prior.id,
            amount_paise: prior.amount_paise,
            reused: true
          };
        }

        fail('Idempotency key already used', 409);
      }
    }

    if (one(db, 'SELECT id FROM invoice_returns WHERE invoice_id = ?', inv.id)) {
      fail('Returned invoice cannot accept payments');
    }

    const paid = one(
      db,
      'SELECT COALESCE(SUM(amount_paise), 0) n FROM payments WHERE invoice_id = ?',
      inv.id
    ).n;

    const amount = positive(body.amount_paise, 'payment');
    if (amount > inv.total_paise - paid) {
      fail('Payment exceeds outstanding amount');
    }

    const method = body.method === 'BANK' ? 'BANK' : 'CASH';
    const isSale = inv.kind === 'SALE';

    const cashOrBank = account(
      db,
      companyId,
      method === 'BANK' ? '1010' : '1000'
    );

    const settlementAccount = account(
      db,
      companyId,
      isSale ? '1100' : '2000'
    );

    const lines = isSale
      ? [DR(cashOrBank, amount), CR(settlementAccount, amount)]
      : [DR(settlementAccount, amount), CR(cashOrBank, amount)];

    const paymentDate = date(body.date || today());

    const voucher = postVoucher(db, {
      companyId,
      userId,
      kind: isSale ? 'RECEIPT' : 'PAYMENT',
      dateValue: paymentDate,
      reference: inv.number,
      memo: `Settlement ${inv.number}`,
      lines,
      idempotencyKey: body.idempotency_key || null
    });

    if (voucher.reused) {
      const previousPayment = one(
        db,
        'SELECT * FROM payments WHERE voucher_id = ?',
        voucher.id
      );

      if (!previousPayment) {
        fail('Duplicate request currently processing', 409);
      }

      return {
        id: previousPayment.id,
        amount_paise: previousPayment.amount_paise,
        reused: true
      };
    }

    const id = uid();

    run(
      db,
      'INSERT INTO payments VALUES (?,?,?,?,?,?,?,?)',
      id,
      companyId,
      inv.id,
      voucher.id,
      amount,
      method,
      paymentDate,
      now()
    );

    return {
      id,
      amount_paise: amount,
      outstanding_paise: inv.total_paise - paid - amount
    };
  });
}

export function listInvoices(db, companyId, kind) {
  const filter = ['SALE', 'PURCHASE'].includes(kind)
    ? ' AND i.kind = ?'
    : '';

  const params = filter
    ? [companyId, kind]
    : [companyId];

  return all(
    db,
    `SELECT
       i.*,
       c.name contact_name,
       COALESCE(
         (SELECT SUM(p.amount_paise)
          FROM payments p WHERE p.invoice_id = i.id),
         0
       ) paid_paise,
       i.total_paise
       - COALESCE(
           (SELECT SUM(p.amount_paise)
            FROM payments p WHERE p.invoice_id = i.id),
           0
         )
       - COALESCE(
           (SELECT SUM(r.total_paise)
            FROM invoice_returns r WHERE r.invoice_id = i.id),
           0
         ) outstanding_paise
     FROM invoices i
     JOIN contacts c ON c.id = i.contact_id
     WHERE i.company_id = ?${filter}
     ORDER BY i.date DESC, i.created_at DESC
     LIMIT 500`,
    ...params
  );
}

export function invoiceDetails(db, companyId, id) {
  const row = one(
    db,
    'SELECT * FROM invoices WHERE company_id = ? AND id = ?',
    companyId,
    id
  );

  if (!row) fail('Invoice not found', 404);

  return {
    ...row,
    items: all(
      db,
      `SELECT it.*, p.name product_name, p.sku
       FROM invoice_items it
       JOIN products p ON p.id = it.product_id
       WHERE it.invoice_id = ?`,
      id
    ),
    payments: all(
      db,
      'SELECT * FROM payments WHERE invoice_id = ? ORDER BY date',
      id
    )
  };
}
