import test from 'node:test';
import assert from 'node:assert/strict';
import {openDatabase} from '../src/db.js';
import {createServer} from '../src/server.js';
import {uid} from '../src/utils.js';

async function withApp(handler){
 const db=openDatabase(':memory:');const server=createServer(db);
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${server.address().port}`;
 try{await handler({db,base});}finally{await new Promise(r=>server.close(r));db.close();}
}
function client(base){
 let cookie='',csrf='';
 const request=async (url,body,method='POST',overrides={})=>{
  const r=await fetch(base+url,{method,headers:{...(body!==undefined?{'Content-Type':'application/json'}:{}),...(csrf?{'X-CSRF-Token':csrf}:{}),...(cookie?{Cookie:cookie}:{}),...overrides},body:body===undefined?undefined:JSON.stringify(body)});
  let data;try{data=await r.json();}catch{data=null;}
  return {status:r.status,data,headers:r.headers};
 };
 return {
  request,
  async login(email,password){const r=await request('/api/auth/login',{email,password});assert.equal(r.status,200,JSON.stringify(r.data));csrf=r.data.csrf;cookie=r.headers.get('set-cookie').split(';')[0];return r;},
  async register(email,password='my-strong-password-123'){return request('/api/auth/register',{name:'Test User',email,password});}
 };
}

test('User-chosen email password login and protected password change',async()=>withApp(async({base})=>{
 const c=client(base),email=`docs${uid()}@example.test`;
 assert.equal((await c.register(email)).status,200);
 await c.login(email,'my-strong-password-123');
 const failOld=await c.request('/api/auth/change-password',{current_password:'wrong',new_password:'another-new-password-123'});
 assert.equal(failOld.status,403);
 const noCsrf=await c.request('/api/auth/change-password',{current_password:'my-strong-password-123',new_password:'another-new-password-123'},'POST',{'X-CSRF-Token':'invalid'});
 assert.equal(noCsrf.status,403);
 const changed=await c.request('/api/auth/change-password',{current_password:'my-strong-password-123',new_password:'another-new-password-123'});
 assert.equal(changed.status,200);
 assert.equal((await c.request('/api/auth/logout',{})).status,200);
 const bad=await c.request('/api/auth/login',{email,password:'my-strong-password-123'});assert.equal(bad.status,401);
 await c.login(email,'another-new-password-123');
}));

test('Company private file upload/list/download/delete isolated and CSRF guarded',async()=>withApp(async({base})=>{
 const a=client(base),b=client(base);
 const ea=`a${uid()}@example.test`, eb=`b${uid()}@example.test`;
 assert.equal((await a.register(ea)).status,200);assert.equal((await b.register(eb)).status,200);
 await a.login(ea,'my-strong-password-123');await b.login(eb,'my-strong-password-123');
 const ca=(await a.request('/api/companies',{name:'A',state_code:'27'})).data.id;
 const cb=(await b.request('/api/companies',{name:'B',state_code:'09'})).data.id;
 const payload={name:'receipt.txt',kind:'Receipt',content_base64:Buffer.from('Testing 123').toString('base64')};
 let r=await a.request(`/api/companies/${ca}/documents`,payload);assert.equal(r.status,200,JSON.stringify(r.data));const fileId=r.data.id;
 assert.equal((await a.request(`/api/companies/${ca}/documents`,undefined,'GET')).data.length,1);
 r=await a.request(`/api/companies/${ca}/documents/${fileId}`,undefined,'GET');assert.equal(r.status,200);
 assert.equal(Buffer.from(r.data.content_base64,'base64').toString(),'Testing 123');
 assert.equal((await b.request(`/api/companies/${ca}/documents`,undefined,'GET')).status,403);
 assert.equal((await b.request(`/api/companies/${ca}/documents/${fileId}`,undefined,'GET')).status,403);
 assert.equal((await b.request(`/api/companies/${ca}/documents/${fileId}`,{},'DELETE')).status,403);
 assert.equal((await a.request(`/api/companies/${ca}/documents`,payload,'POST',{'X-CSRF-Token':'wrong'})).status,403);
 assert.equal((await b.request(`/api/companies/${cb}/documents`,undefined,'GET')).data.length,0);
 assert.equal((await a.request(`/api/companies/${ca}/documents`,{name:'bad.html',kind:'Document',content_base64:Buffer.from('<script/>').toString('base64')})).status,400);
 assert.equal((await a.request(`/api/companies/${ca}/documents`,{name:'fake.pdf',kind:'Document',content_base64:Buffer.from('not pdf').toString('base64')})).status,400);
 assert.equal((await a.request(`/api/companies/${ca}/documents/${fileId}`,{},'DELETE')).status,200);
 assert.equal((await a.request(`/api/companies/${ca}/documents`,undefined,'GET')).data.length,0);
}));

test('File library supports real PDF headers, voice recordings and rejects oversize payload',async()=>withApp(async({base})=>{
 const a=client(base);const ea=`c${uid()}@example.test`;await a.register(ea);await a.login(ea,'my-strong-password-123');
 const ca=(await a.request('/api/companies',{name:'C',state_code:'27'})).data.id;
 const pdf=Buffer.from('%PDF-1.4\nminimal test');
 const r=await a.request(`/api/companies/${ca}/documents`,{name:'bill.pdf',kind:'Invoice',content_base64:pdf.toString('base64')});assert.equal(r.status,200);
 const audio=await a.request(`/api/companies/${ca}/documents`,{name:'voice.webm',kind:'Voice note',content_base64:Buffer.from([0x1a,0x45,0xdf,0xa3]).toString('base64')});assert.equal(audio.status,200);
 const bad=await a.request(`/api/companies/${ca}/documents`,{name:'too-big.txt',kind:'Document',content_base64:Buffer.alloc(5*1024*1024+1,97).toString('base64')});assert.equal(bad.status,413);
}));
