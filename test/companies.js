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
export const GST_TYPES=['UNREGISTERED','REGULAR','COMPOSITION','OTHER'];
export function createCompany(db,userId,body) {
  return transaction(db,()=>{
    const id=uid(), created=now();const name=text(body.name,'company name',120);
    const stateCode=state(body.state_code);
    const legacy=body.gst_type===undefined||body.gst_type===null||body.gst_type==='';
    const gstType=legacy?'REGULAR':String(body.gst_type).toUpperCase();
    if(!GST_TYPES.includes(gstType))fail('Invalid GST registration type');
    let gstin=null;
    if(gstType==='UNREGISTERED'){gstin=null;}
    else if(legacy){
      gstin=body.gstin?text(body.gstin,'GSTIN',15).toUpperCase():null;
      if(gstin&&!/^[0-9]{2}[A-Z0-9]{13}$/.test(gstin))fail('Invalid GSTIN format');
    }else{
      gstin=text(body.gstin,'GSTIN (required for GST-registered business)',15).toUpperCase();
      if(!/^[0-9]{2}[A-Z0-9]{13}$/.test(gstin))fail('Invalid GSTIN format');
      if(gstin.slice(0,2)!==stateCode)fail('GSTIN first 2 digits must match the Business State code');
    }
    run(db,'INSERT INTO companies VALUES (?,?,?,?,?,?,?)',id,name,stateCode,gstin,String(body.address||'').slice(0,500),userId,created);
    run(db,'INSERT INTO company_settings(company_id,gst_type,business_type) VALUES (?,?,?)',id,gstType,String(body.business_type||'').slice(0,40)||null);
    run(db,'INSERT INTO company_users VALUES (?,?,?)',id,userId,'OWNER');
    for(const [code,aname,type] of masters)run(db,'INSERT INTO accounts VALUES (?,?,?,?,?,1)',uid(),id,code,aname,type);
    run(db,'INSERT INTO subscriptions VALUES (?,?,?,?,?,?)',id,'FREE','FREE',0,created,null);
    run(db,'INSERT INTO audit_log VALUES (?,?,?,?,?,?,?)',uid(),id,userId,'COMPANY_CREATE',id,null,created);
    return {id,name,state_code:stateCode,gstin,gst_type:gstType};
  });
}
export function listCompanies(db,userId) {
  return all(db,`SELECT c.id,c.name,c.state_code,c.gstin,c.address,COALESCE(s.gst_type,'REGULAR') gst_type,s.business_type,m.role FROM companies c LEFT JOIN company_settings s ON s.company_id=c.id JOIN company_users m ON m.company_id=c.id WHERE m.user_id=? ORDER BY c.created_at`,userId);
}
export function companyGstType(db,companyId){return one(db,'SELECT gst_type FROM company_settings WHERE company_id=?',companyId)?.gst_type||'REGULAR';}
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
