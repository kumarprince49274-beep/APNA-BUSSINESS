
import { uid, now, fail, text, state } from './utils.js';
import { one, all, run, transaction } from './db.js';

const masters = [
  ['1000', 'Cash', 'ASSET'],
  ['1010', 'Bank', 'ASSET'],
  ['1100', 'Accounts Receivable', 'ASSET'],
  ['1200', 'Inventory', 'ASSET'],
  ['1300', 'Input CGST', 'ASSET'],
  ['1310', 'Input SGST', 'ASSET'],
  ['1320', 'Input IGST', 'ASSET'],
  ['2000', 'Accounts Payable', 'LIABILITY'],
  ['2100', 'Output CGST', 'LIABILITY'],
  ['2110', 'Output SGST', 'LIABILITY'],
  ['2120', 'Output IGST', 'LIABILITY'],
  ['3000', 'Owner Capital', 'EQUITY'],
  ['4000', 'Sales Revenue', 'REVENUE'],
  ['4010', 'Service Revenue', 'REVENUE'],
  ['5000', 'Cost of Goods Sold', 'EXPENSE'],
  ['6000', 'Operating Expenses', 'EXPENSE']
];

const GST_TYPES = new Set([
  'UNREGISTERED',
  'REGULAR',
  'COMPOSITION'
]);

function normalizeGstRegistration(body, stateCode) {
  const type = String(
    body.gst_registration_type ?? 'REGULAR'
  ).trim().toUpperCase();

  if (!GST_TYPES.has(type)) {
    fail(
      'GST registration type must be UNREGISTERED, REGULAR or COMPOSITION'
    );
  }

  const rawGstin = String(body.gstin ?? '')
    .trim()
    .toUpperCase();

  if (type === 'UNREGISTERED') {
    if (rawGstin) {
      fail('UNREGISTERED businesses must not provide a GSTIN');
    }

    return {
      gstin: null,
      gst_registration_type: type
    };
  }

  if (!rawGstin) {
    fail(`${type} registration requires a GSTIN`);
  }

  if (!/^[0-9]{2}[A-Z0-9]{13}$/.test(rawGstin)) {
    fail('Invalid GSTIN format');
  }

  if (rawGstin.slice(0, 2) !== stateCode) {
    fail('GSTIN state code must match the company state code');
  }

  return {
    gstin: rawGstin,
    gst_registration_type: type
  };
}

export function createCompany(db, userId, body) {
  return transaction(db, () => {
    const id = uid();
    const created = now();

    const name = text(body.name, 'company name', 120);
    const stateCode = state(body.state_code);

    const registration = normalizeGstRegistration(
      body,
      stateCode
    );

    const address = String(body.address ?? '').trim().slice(0, 500);

    run(
      db,
      `INSERT INTO companies
       (id, name, state_code, gstin, address, owner_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      id,
      name,
      stateCode,
      registration.gstin,
      address,
      userId,
      created
    );

    run(
      db,
      'INSERT INTO company_users VALUES (?, ?, ?)',
      id,
      userId,
      'OWNER'
    );

    for (const [code, accountName, type] of masters) {
      run(
        db,
        `INSERT INTO accounts
         (id, company_id, code, name, type, is_system)
         VALUES (?, ?, ?, ?, ?, 1)`,
        uid(),
        id,
        code,
        accountName,
        type
      );
    }

    run(
      db,
      `INSERT INTO subscriptions
       (company_id, plan, status, ai_used, started_at, ends_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      id,
      'FREE',
      'FREE',
      0,
      created,
      null
    );

    run(
      db,
      `INSERT INTO company_settings
       (company_id, gst_type, updated_at)
       VALUES (?, ?, ?)`,
      id,
      registration.gst_registration_type,
      created
    );

    run(
      db,
      `INSERT INTO audit_log
       (id, company_id, actor_id, action, entity_id, details, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      uid(),
      id,
      userId,
      'COMPANY_CREATE',
      id,
      JSON.stringify({
        gst_registration_type: registration.gst_registration_type
      }),
      created
    );

    return {
      id,
      name,
      state_code: stateCode,
      gstin: registration.gstin,
      gst_registration_type: registration.gst_registration_type,
      address
    };
  });
}

export function listCompanies(db, userId) {
  return all(
    db,
    `SELECT
       c.id,
       c.name,
       c.state_code,
       c.gstin,
       c.address,
       m.role,
       COALESCE(cs.gst_type, 'REGULAR') AS gst_registration_type
     FROM companies c
     JOIN company_users m
       ON m.company_id = c.id
     LEFT JOIN company_settings cs
       ON cs.company_id = c.id
     WHERE m.user_id = ?
     ORDER BY c.created_at`,
    userId
  );
}

export function account(db, companyId, code) {
  const result = one(
    db,
    'SELECT id FROM accounts WHERE company_id = ? AND code = ?',
    companyId,
    code
  );

  if (!result) {
    fail(`Account ${code} missing`);
  }

  return result.id;
}

export function checkOwnRecord(db, table, id, companyId) {
  const allowedTables = [
    'contacts',
    'products',
    'invoices',
    'accounts',
    'vouchers',
    'workbooks'
  ];

  if (!allowedTables.includes(table)) {
    fail('Invalid table');
  }

  const row = one(
    db,
    `SELECT * FROM ${table} WHERE id = ? AND company_id = ?`,
    id,
    companyId
  );

  if (!row) {
    fail(`${table.slice(0, -1)} not found`, 404);
  }

  return row;
}
