import test from 'node:test';
import assert from 'node:assert/strict';
import {openDatabase,one,run} from '../src/db.js';
import {register} from '../src/auth.js';
import {createCompany,listCompanies} from '../src/companies.js';
import {issueInvoice} from '../src/invoices.js';
import {gstReport} from '../src/reports.js';
import {uid} from '../src/utils.js';
function setup(){const db=openDatabase(':memory:');const user=register(db,{name:'T',email:`t${uid()}@example.com`,password:'a-very-strong-test-password'});return {db,user};}
function seed(db,c,uidv){
 const p=uid(),cu=uid(),su=uid();
 db.prepare('INSERT INTO products VALUES (?,?,?,?,?,?,?,?,?,?)').run(p,c.id,'S'+p.slice(0,6),'Item','1234',1800,100000,60000,1,1);
 db.prepare('INSERT INTO contacts VALUES (?,?,?,?,?,?,?,?,?)').run(cu,c.id,'CUSTOMER','Cust','09',null,null,null,new Date().toISOString());
 db.prepare('INSERT INTO contacts VALUES (?,?,?,?,?,?,?,?,?)').run(su,c.id,'SUPPLIER','Supp','09',null,null,null,new Date().toISOString());
 issueInvoice(db,c.id,uidv,{kind:'PURCHASE',contact_id:su,items:[{product_id:p,qty:10,unit_paise:60000}]});
 return {p,cu};
}
test('Non-GST company without GSTIN is created and charges zero GST',()=>{
 const {db,user}=setup();
 const c=createCompany(db,user.id,{name:'Kirana',state_code:'09',gst_type:'UNREGISTERED',gstin:'09ABCDE1234F1Z5'});
 assert.equal(c.gst_type,'UNREGISTERED');assert.equal(c.gstin,null);
 const {p,cu}=seed(db,c,user.id);
 const inv=issueInvoice(db,c.id,user.id,{kind:'SALE',contact_id:cu,items:[{product_id:p,qty:2,unit_paise:100000}]});
 assert.equal(inv.gst_paise,0);assert.equal(inv.total_paise,200000);
 assert.equal(listCompanies(db,user.id)[0].gst_type,'UNREGISTERED');
});
test('Regular GST company needs matching GSTIN and charges GST',()=>{
 const {db,user}=setup();
 assert.throws(()=>createCompany(db,user.id,{name:'ABC',state_code:'09',gst_type:'REGULAR'}),/GSTIN/);
 assert.throws(()=>createCompany(db,user.id,{name:'ABC',state_code:'09',gst_type:'REGULAR',gstin:'27ABCDE1234F1Z5'}),/match/);
 assert.throws(()=>createCompany(db,user.id,{name:'ABC',state_code:'09',gst_type:'BOGUS'}),/Invalid GST/);
 const c=createCompany(db,user.id,{name:'ABC',state_code:'09',gst_type:'REGULAR',gstin:'09ABCDE1234F1Z5'});
 const {p,cu}=seed(db,c,user.id);
 const inv=issueInvoice(db,c.id,user.id,{kind:'SALE',contact_id:cu,items:[{product_id:p,qty:2,unit_paise:100000}]});
 assert.equal(inv.gst_paise,36000);
});
test('Legacy company without settings row and legacy API body keep GST behaviour',()=>{
 const {db,user}=setup();
 const c=createCompany(db,user.id,{name:'Old',state_code:'09'});
 assert.equal(c.gst_type,'REGULAR');
 db.prepare('DELETE FROM company_settings WHERE company_id=?').run(c.id);
 assert.equal(listCompanies(db,user.id)[0].gst_type,'REGULAR');
 const {p,cu}=seed(db,c,user.id);
 assert.equal(issueInvoice(db,c.id,user.id,{kind:'SALE',contact_id:cu,items:[{product_id:p,qty:1,unit_paise:100000}]}).gst_paise,18000);
});
