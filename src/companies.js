import {uid,now,fail,text,state} from './utils.js';
import {one,all,run,transaction} from './db.js';
const masters=[
 ['1000','Cash','ASSET'],['1010','Bank','ASSET'],['1100','Accounts Receivable','ASSET'],
 ['1200','Inventory','ASSET'],['1300','Input CGST','ASSET'],['1310','Input SGST','ASSET'],['1320','Input IGST','ASSET'],
 ['2000','Accounts Payable','LIABILITY'],['2100','Output CGST','LIABILITY'],
 ['2110','Output SGST','LIABILITY'],['2120','Output IGST','LIABILITY'],
 ['3000','Owner Capital','EQUITY'],['4000','Sales Revenue','REVENUE'],
 ['4010','Service Revenue','REVENUE'],['5000','Cost of Goods Sold','EXPENSE'],
 ['6000','Operating Expenses','EXPENSE']
];
export function createCompany(db,userId,body) {
  return transaction(db,()=>{
    const id=uid(), created=now();const name=text(body.name,'company name',120);
    const stateCode=state(body.state_code);
    const gstin=body.gstin?text(body.gstin,'GSTIN',15).toUpperCase():null;
    if(gstin&&!/^[0-9]{2}[A-Z0-9]{13}$/.test(gstin))fail('Invalid GSTIN format');
    run(db,'INSERT INTO companies VALUES (?,?,?,?,?,?,?)',id,name,stateCode,gstin,String(body.address||'').slice(0,500),userId,created);
    run(db,'INSERT INTO company_users VALUES (?,?,?)',id,userId,'OWNER');
    for(const [code,aname,type] of masters)run(db,'INSERT INTO accounts VALUES (?,?,?,?,?,1)',uid(),id,code,aname,type);
    run(db,'INSERT INTO subscriptions VALUES (?,?,?,?,?,?)',id,'FREE','FREE',0,created,null);
    run(db,'INSERT INTO audit_log VALUES (?,?,?,?,?,?,?)',uid(),id,userId,'COMPANY_CREATE',id,null,created);
    return {id,name,state_code:stateCode,gstin};
  });
}
export function listCompanies(db,userId) {
  return all(db,`SELECT c.id,c.name,c.state_code,c.gstin,c.address,m.role FROM companies c JOIN company_users m ON m.company_id=c.id WHERE m.user_id=? ORDER BY c.created_at`,userId);
}
export function account(db,companyId,code) {
  const a=one(db,'SELECT id FROM accounts WHERE company_id=? AND code=?',companyId,code);
  if(!a) fail(`Account ${code} missing`);
  return a.id;
}
export function checkOwnRecord(db,table,id,companyId) {
  if(!['contacts','products','invoices','accounts','vouchers','workbooks'].includes(table))fail('Invalid table');
  const row=one(db,`SELECT * FROM ${table} WHERE id=? AND company_id=?`,id,companyId);
  if(!row)fail(`${table.slice(0,-1)} not found`,404);
  return row;
}
