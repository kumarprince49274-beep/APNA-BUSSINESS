import {dashboard,stockReport,outstandingReport,gstReport,profitLoss} from './reports.js';
import {text} from './utils.js';
const rs=n=>`₹${(n/100).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
export function localAssistant(db,companyId,message){
 const m=text(message,'message',1500).toLowerCase();
 const dash=dashboard(db,companyId);
 if(/(profit|लाभ|munafa|loss|घाटा)/.test(m))return {reply:`Revenue ${rs(dash.sales_paise)}, gross profit ${rs(dash.gross_profit_paise)}, net profit ${rs(dash.net_profit_paise)}. These are ledger-derived values, not AI estimates.`,mode:'LOCAL_RULES'};
 if(/(stock|inventory|स्टॉक|सामान|restock)/.test(m)){
  const low=stockReport(db,companyId).filter(x=>x.low_stock).slice(0,12);
  return {reply:low.length?`Low stock: ${low.map(x=>`${x.name} (${x.qty} units)`).join(', ')}`:'No products are currently at or below their saved reorder level.',mode:'LOCAL_RULES'};
 }
 if(/(outstanding|due|receivable|payable|बकाया|उधार)/.test(m)){
  const rows=outstandingReport(db,companyId);return {reply:`Customer due ${rs(rows.filter(x=>x.kind==='SALE').reduce((s,x)=>s+x.outstanding_paise,0))}. Supplier due ${rs(rows.filter(x=>x.kind==='PURCHASE').reduce((s,x)=>s+x.outstanding_paise,0))}.`,mode:'LOCAL_RULES'};
 }
 if(/(gst|tax|जीएसटी)/.test(m)){
  const x=gstReport(db,companyId);return {reply:`Draft output GST ${rs(x.sales.cgst_paise+x.sales.sgst_paise+x.sales.igst_paise)}; draft input GST ${rs(x.purchases.cgst_paise+x.purchases.sgst_paise+x.purchases.igst_paise)}. Estimate: ${rs(x.estimated_net_gst_paise)}. Please check ITC eligibility with your accountant; this is NOT a filed return.`,mode:'LOCAL_RULES'};
 }
 if(/(cash|bank|नकद|बैंक)/.test(m))return {reply:`Ledger cash balance ${rs(dash.cash_paise)} and bank balance ${rs(dash.bank_paise)}.`,mode:'LOCAL_RULES'};
 if(/(sales|revenue|बिक्री|कमाई)/.test(m))return {reply:`Total booked sales revenue ${rs(dash.sales_paise)}. Your platform's subscription revenue is tracked separately and is NOT included here.`,mode:'LOCAL_RULES'};
 return {reply:'Local accounting assistant: ask about profit, sales, GST, inventory, stock alerts, customer dues, supplier dues, cash or bank. This edition does not connect to a paid AI model, OCR, audio or video processing. No financial entry is posted through chat.',mode:'LOCAL_RULES'};
}
