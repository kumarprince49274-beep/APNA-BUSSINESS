'use strict';
const $=id=>document.getElementById(id);
const state={user:null,csrf:'',companies:[],companyId:null,page:'assistant',draftItems:[],invoiceKind:'SALE',authMode:'login',accounts:[],chat:[],bankAccountId:null,bankCandidates:[],recorder:null,recordChunks:[],recordStream:null};
const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>'₹'+(Number(n||0)/100).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2});
function paise(x){const s=String(x??'').trim();if(!/^\d+(?:\.\d{1,2})?$/.test(s))throw Error('Enter a valid amount with at most 2 decimal places');const [a,b='']=s.split('.');const amount=Number(a)*100+Number(b.padEnd(2,'0'));if(!Number.isSafeInteger(amount))throw Error('Amount too high');return amount;}
const rupees=x=>(Number(x||0)/100).toFixed(2);
const C=()=>`/api/companies/${state.companyId}`;
async function api(path,{method='GET',body}={}){
 const options={method,credentials:'same-origin',headers:{}};
 if(body!==undefined){options.headers['Content-Type']='application/json';options.body=JSON.stringify(body);}
 if(method!=='GET'&&state.csrf)options.headers['X-CSRF-Token']=state.csrf;
 const r=await fetch(path,options);
 const json=await r.json().catch(()=>({error:'Invalid server response'}));
 if(!r.ok)throw Error(json.error||`Request failed (${r.status})`);
 return json;
}
function toast(message){const t=$('toast');t.textContent=message;t.classList.remove('hidden');setTimeout(()=>t.classList.add('hidden'),4500);}
function err(error){toast(error?.message||String(error));}
function openModal(title,html){$('modal-title').textContent=title;$('modal-content').innerHTML=html;$('modal-backdrop').classList.remove('hidden');}
function closeModal(){$('modal-backdrop').classList.add('hidden');$('modal-content').innerHTML='';}
const input=(name,title,options={})=>`<label>${safe(title)}<input name="${name}" type="${options.type||'text'}" ${options.required?'required':''} ${options.value!==undefined?`value="${safe(options.value)}"`:''} ${options.step?`step="${options.step}"`:''} ${options.min!==undefined?`min="${options.min}"`:''} placeholder="${safe(options.placeholder||'')}"></label>`;
const select=(name,title,rows,valueField='id',labelField='name',extra='')=>`<label>${safe(title)}<select name="${name}" required>${extra}${rows.map(r=>`<option value="${safe(r[valueField])}">${safe(r[labelField])}</option>`).join('')}</select></label>`;
const form=(action,fields,submit='Save')=>`<form data-action="${action}"><div class="form-grid">${fields}</div><button class="btn primary" type="submit">${safe(submit)}</button></form>`;
function table(rows,columns){if(!rows?.length)return '<div class="empty">No records yet. Use the Create button to add your first entry.</div>';
 return `<div class="table-wrap"><table class="table"><thead><tr>${columns.map(c=>`<th>${safe(c.label)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${columns.map(c=>`<td>${c.html?c.html(row):safe(row[c.key])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}
function panel(title,content,buttons=''){return `<div class="panel"><div class="panel-head"><h3>${safe(title)}</h3><div class="actions">${buttons}</div></div>${content}</div>`;}
function btn(action,label,more=''){return `<button class="btn ${more}" type="button" data-action-button="${action}">${safe(label)}</button>`;}
function loginUI(){ $('auth').classList.remove('hidden');$('workspace').classList.add('hidden'); }
async function signedIn(data){state.user=data.user;state.csrf=data.csrf;$('user-label').textContent=`${data.user.name} • ${data.user.email}`;$('auth').classList.add('hidden');$('workspace').classList.remove('hidden');await loadCompanies();}
async function loadCompanies(){
 state.companies=await api('/api/companies');
 if(!state.companies.length){$('company-select').innerHTML='<option value="">No company yet</option>';state.companyId=null;await showPage(state.page);showCompanyModal();return;}
 if(!state.companies.some(c=>c.id===state.companyId))state.companyId=state.companies[0].id;
 $('company-select').innerHTML=state.companies.map(c=>`<option value="${safe(c.id)}" ${c.id===state.companyId?'selected':''}>${safe(c.name)}</option>`).join('');
 await showPage(state.page);
}
async function showPage(page){
 state.page=page;$('nav').querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
 document.querySelector('.sidebar').classList.remove('open');
 const names={files:'Documents & files',dashboard:'Business overview',contacts:'Customers & Suppliers',products:'Inventory',invoices:'Transactions',journal:'Vouchers & Ledgers',returns:'Credit & Debit Notes',drafts:'Draft Approvals',banking:'Bank Reconciliation',reports:'Reports',spreadsheets:'Smart Spreadsheet',assistant:'AI Accountant',subscription:'Subscriptions',settings:'Settings'};
 $('page-title').textContent=names[page]||page;
 $('page-kicker').textContent=({dashboard:'YOUR BUSINESS',reports:'YOUR JOURNAL',files:'PRIVATE LIBRARY',assistant:'AI TOOLS',invoices:'YOUR BUSINESS'})[page]||'YOUR BUSINESS';
 $('page-subtitle').textContent=({dashboard:'Your business at a glance',files:'Company document workspace',reports:'Recorded financial figures',invoices:'Sales, purchases and payments'})[page]||'APNA BUSINESS workspace';
 $('banner').textContent=page==='assistant'?'This is a local rules-based helper, not a connected generative AI model.':'';
 if(!state.companyId){$('content').innerHTML=panel('One-time setup: create your business',`<p>You are signed in as ${safe(state.user?.email)}. Create a company to unlock Overview, Transactions, Reports and Files.</p>${btn('open-company','+ Create business','primary')}`);return;}
 $('content').innerHTML=panel('Loading','Loading records…');
 try{
  const handlers={dashboard:renderDashboard,contacts:renderContacts,products:renderProducts,invoices:renderInvoices,journal:renderJournal,returns:renderReturns,drafts:renderDrafts,banking:renderBanking,reports:renderReports,spreadsheets:renderSpreadsheets,files:renderFiles,assistant:renderAssistant,subscription:renderSubscriptions,settings:renderSettings};
  if(!handlers[page])throw Error('This page is unavailable in the local edition');
  await handlers[page]();
 }catch(e){$('content').innerHTML=panel('Unable to display page',`<p class="error">${safe(e.message)}</p>${btn('retry-page','Try again')}`);err(e);}
}
async function renderDashboard(){
 const d=await api(`${C()}/dashboard`);
 const today=new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
 const cards=[
  ['Recorded sales',d.sales_paise,'arrow'],
  ['Recorded purchases',d.purchases_paise,'arrow'],
  ['Net profit estimate',d.net_profit_paise,'pulse'],
  ['Cash balance',d.cash_paise,'wallet']
 ];
 const secondary=[['Gross profit',d.gross_profit_paise],['Customers owe',d.receivables_paise],['Suppliers owed',d.payables_paise],['Stock value',d.stock_value_paise],['Draft GST net',d.provisional_gst_paise]];
 $('content').innerHTML=`
 <div class="hero"><div class="hero-copy"><div class="hero-date">${safe(today)}</div><h1>Here’s what’s on the books.</h1></div><button class="btn primary record-btn" type="button" data-action-button="record-transaction">${iconSVG('plus')} Record transaction</button></div>
 <div class="cards hero-cards">${cards.map(([label,value,ico])=>`<div class="card financial-card"><div class="card-head"><span class="k-label">${safe(label)}</span>${iconSVG(ico)}</div><div class="k-value">${money(value)}</div><div class="card-hint">Based on recorded entries</div></div>`).join('')}</div>
 <div class="dashboard-main-grid">
  <div class="panel activity-panel"><div class="section-kicker">THIS MONTH &amp; BEYOND</div><div class="section-title-row"><h3>Recorded activity</h3>${iconSVG('chart')}</div>
   <div class="activity-metrics"><div><span class="metric-indicator sales"></span>Sales recorded<strong>${money(d.sales_paise)}</strong></div><div><span class="metric-indicator costs"></span>Purchases recorded<strong>${money(d.purchases_paise)}</strong></div><div><span class="metric-indicator profit"></span>Net profit estimate<strong>${money(d.net_profit_paise)}</strong></div></div>
   <div class="activity-explainer">These are all-time recorded figures, not just this month's activity. Net profit is a local accounting estimate.</div>
  </div>
  <div class="panel money-panel"><div class="section-kicker">MONEY HELD</div><h3>Account balances</h3><div class="balance-row">${iconSVG('wallet')}<span>Cash</span><strong>${money(d.cash_paise)}</strong></div><div class="balance-row">${iconSVG('bank')}<span>Bank</span><strong>${money(d.bank_paise)}</strong></div><div class="money-note">Balances reflect posted journal entries, not a live bank connection.</div></div>
 </div>
 <div class="financial-more"><div class="section-kicker">FINANCIAL OVERVIEW</div><div class="cards extra-cards">${secondary.map(([label,value])=>`<div class="card"><div class="k-label">${safe(label)}</div><div class="k-value">${money(value)}</div></div>`).join('')}<div class="card"><div class="k-label">Low-stock products</div><div class="k-value">${safe(d.low_stock_count)}</div></div></div></div>
 ${panel('Recent invoices',table(d.latest_invoices,[{key:'number',label:'Invoice'},{key:'kind',label:'Type'},{key:'date',label:'Date'},{label:'Total',html:r=>money(r.total_paise)}]),btn('new-sale','+ Create invoice','primary'))}
 <p class="footer-note">All figures use saved accounting records. GST is only a draft estimate; verify with a qualified accountant before filing. Inventory uses whole-unit FIFO.</p>`;
}
function iconSVG(name){return `<svg class="metric-icon" aria-hidden="true"><use href="#i-${name}"></use></svg>`;}
async function renderFiles(){
 const rows=await api(`${C()}/documents`);
 const role=state.companies.find(c=>c.id===state.companyId)?.role;
 const canDelete=['OWNER','ACCOUNTANT','MANAGER'].includes(role);
 const canUpload=['OWNER','ACCOUNTANT','MANAGER','SALES'].includes(role);
 $('content').innerHTML=`<div class="files-page">
 <div class="panel files-upload-panel"><div class="files-heading"><span class="files-symbol">${iconSVG('folder')}</span><div><h3>Your private file library</h3><p>Add invoice photos, PDFs, text or Word documents, and voice notes from your device.</p></div></div>
 <div class="files-actions"><label>Save these as<select id="file-kind"><option>Document</option><option>Invoice</option><option>Receipt</option></select></label><input id="file-picker" class="visually-hidden" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.doc,.docx" aria-label="Choose a file from your device" ${canUpload?'':'disabled'}><button type="button" class="btn primary" data-action-button="add-file" ${canUpload?'':'disabled title="Read-only company role"'}>${iconSVG('plus')} Add from device</button><button type="button" class="btn" id="record-voice" data-action-button="record-voice" ${canUpload?'':'disabled title="Read-only company role"'}>Record voice note</button><button type="button" class="btn hidden" id="stop-voice" data-action-button="stop-voice">Stop recording</button></div>
 <div class="note" id="file-note">Saved locally to this company's SQLite database; not sent to an external AI provider. Images/PDFs/text can be opened in your browser; Word files download to your device. Voice notes are saved, not transcribed. 5 MB per file, 50 MB per company.</div></div>
 <div class="panel"><div class="panel-head"><div><h3>Saved files</h3><p class="muted small">Private to authorized members of this business</p></div><span class="pill">${rows.length}</span></div>
 ${rows.length?table(rows,[{key:'name',label:'File'},{key:'kind',label:'Type'},{label:'Size',html:r=>`${(r.size_bytes/1024).toFixed(1)} KB`},{key:'created_at',label:'Saved'},{label:'Actions',html:r=>`<button type="button" class="btn tiny" data-action-button="open-file:${safe(r.id)}">Open</button> <button type="button" class="btn tiny" data-action-button="download-file:${safe(r.id)}">Download</button> ${canDelete?`<button type="button" class="btn tiny red" data-action-button="delete-file:${safe(r.id)}">Delete</button>`:''}`} ]):`<div class="files-empty">${iconSVG('folder')}<strong>Your library is empty</strong><span>Choose Add from device or Record voice note to save the first file.</span></div>`}</div></div>`;
 $('file-picker').addEventListener('change',e=>{const chosen=e.target.files?.[0];if(chosen)uploadSelectedFile(chosen,$('file-kind').value).catch(err);});
}
function bytesToBase64(bytes){let out='';const chunk=8192;for(let n=0;n<bytes.length;n+=chunk)out+=String.fromCharCode(...bytes.slice(n,n+chunk));return btoa(out);}
async function uploadSelectedFile(file,kind){
 if(!state.companyId)throw Error('Create or select a company first');
 if(file.size<1||file.size>5*1024*1024)throw Error('Maximum file size is 5 MB');
 const id=state.companyId;
 const bytes=new Uint8Array(await file.arrayBuffer());
 const saved=await api(`/api/companies/${id}/documents`,{method:'POST',body:{name:file.name,kind,content_base64:bytesToBase64(bytes)}});
 toast(`Saved ${saved.name}`);if(state.companyId===id)await showPage('files');
}
async function openStoredFile(id,download=false){
 const data=await api(`${C()}/documents/${encodeURIComponent(id)}`);
 const binary=atob(data.content_base64);const bytes=new Uint8Array(binary.length);
 for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
 const blob=new Blob([bytes],{type:data.mime_type});const url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;
 const preview=!download&&(data.mime_type.startsWith('image/')||data.mime_type==='application/pdf'||data.mime_type==='text/plain');
 if(preview){const win=window.open(url,'_blank','noopener,noreferrer');if(!win){a.download=data.name;a.click();}}
 else{a.download=data.name;a.click();}
 setTimeout(()=>URL.revokeObjectURL(url),60000);
}
async function startVoice(){
 if(state.recorder)throw Error('A recording is already in progress');
 if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder)throw Error('Voice recording is not available in this browser');
 const stream=await navigator.mediaDevices.getUserMedia({audio:true});
 const format=['audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus','audio/mp4'].find(t=>MediaRecorder.isTypeSupported(t));
 if(!format){stream.getTracks().forEach(t=>t.stop());throw Error('No supported audio recording format available');}
 state.recordStream=stream;state.recordChunks=[];state.recordingCompanyId=state.companyId;
 const recorder=new MediaRecorder(stream,{mimeType:format});state.recorder=recorder;
 recorder.ondataavailable=e=>{if(e.data.size)state.recordChunks.push(e.data);};
 recorder.onerror=()=>{err(Error('Microphone recording failed'));};
 recorder.onstop=async()=>{
  try{
   const type=recorder.mimeType.split(';')[0];const ext=type==='audio/mp4'?'.m4a':type==='audio/ogg'?'.ogg':'.webm';
   const blob=new Blob(state.recordChunks,{type});
   if(!blob.size)throw Error('No audio recorded');
   if(state.recordingCompanyId!==state.companyId)throw Error('Return to the original company before saving this voice note');
   await uploadSelectedFile(new File([blob],`voice-${new Date().toISOString().replace(/[:.]/g,'-')}${ext}`,{type}),'Voice note');
  }catch(e){err(e);}finally{state.recordChunks=[];state.recorder=null;state.recordStream?.getTracks().forEach(t=>t.stop());state.recordStream=null;state.recordingCompanyId=null;
   $('stop-voice')?.classList.add('hidden');$('record-voice')?.classList.remove('hidden');}
 };
 recorder.start(1500);$('record-voice')?.classList.add('hidden');$('stop-voice')?.classList.remove('hidden');
 const note=$('file-note');if(note)note.textContent='Recording… click Stop recording to save your voice note. No speech transcription is performed.';
}
function stopVoice(){if(state.recorder?.state==='recording')state.recorder.stop();}
async function renderContacts(){
 const rows=await api(`${C()}/contacts`);
 $('content').innerHTML=panel('Contact directory',table(rows,[{key:'name',label:'Name'},{key:'kind',label:'Type'},{key:'state_code',label:'State'},{key:'gstin',label:'GSTIN'},{key:'phone',label:'Phone'}]),btn('new-contact','+ Add customer / supplier','primary'));
}
async function renderProducts(){
 const rows=await api(`${C()}/products`);
 $('content').innerHTML=panel('Product catalog & FIFO quantity',table(rows,[{key:'sku',label:'SKU'},{key:'name',label:'Product'},{label:'Sale rate',html:r=>money(r.sale_price_paise)},{label:'Cost rate',html:r=>money(r.cost_price_paise)},{label:'GST',html:r=>`${r.gst_bps/100}%`},{key:'stock_qty',label:'Stock'},{key:'reorder_level',label:'Reorder at'}]),btn('new-product','+ Add product','primary'))+
 `<p class="note">Stock quantity increases from posted purchases and decreases from sales. Product creation alone does not add stock.</p>`;
}
async function renderInvoices(){
 const rows=await api(`${C()}/invoices`);
 const canReturn=['OWNER','ACCOUNTANT'].includes(state.companies.find(c=>c.id===state.companyId)?.role);
 $('content').innerHTML=panel('Invoices',table(rows,[{key:'number',label:'Number'},{key:'kind',label:'Type'},{key:'contact_name',label:'Customer / Supplier'},{key:'date',label:'Date'},{label:'Total',html:r=>money(r.total_paise)},{label:'Outstanding',html:r=>money(r.outstanding_paise)},{label:'Action',html:r=>`${btn(`view-invoice:${r.id}`,'Details','tiny')} ${r.outstanding_paise>0?btn(`pay-invoice:${r.id}`,'Record payment','tiny'):''} ${canReturn&&r.paid_paise===0&&r.outstanding_paise===r.total_paise?btn(`full-return:${r.id}`,'Full Return','tiny red'):''}`}]),`${btn('new-sale','+ Sale','primary')}${btn('new-purchase','+ Purchase')}${btn('export-invoices','Export CSV')}`);
}
async function renderReturns(){
 const notes=await api(`${C()}/returns`);
 $('content').innerHTML=panel('Credit & Debit Notes (full unpaid invoices only)',
  '<p class="note warn">Development limitation: a return is allowed only when the original invoice has NO payments. Full invoice only, no refunds, no partial lines. A credit/debit note creates reversing ledger entries and stock movements. Consult an accountant before official GST reporting.</p>'+
  table(notes,[{key:'number',label:'Note'},{key:'kind',label:'Type'},{key:'original_invoice_number',label:'Original Invoice'},{key:'date',label:'Date'},{label:'Total',html:r=>money(r.total_paise)}]));
}
async function renderJournal(){
 const [vouchers,accounts]=await Promise.all([api(`${C()}/vouchers`),api(`${C()}/accounts`)]);state.accounts=accounts;
 $('content').innerHTML=panel('Posted vouchers',table(vouchers,[{key:'date',label:'Date'},{key:'kind',label:'Type'},{key:'reference',label:'Reference'},{key:'memo',label:'Narration'},{label:'Details',html:r=>btn(`view-voucher:${r.id}`,'View','tiny')}]),`${btn('new-journal','+ Journal Entry','primary')}${btn('new-capital','+ Capital')}`)+
 panel('Chart of accounts',table(accounts,[{key:'code',label:'Code'},{key:'name',label:'Account'},{key:'type',label:'Type'},{label:'System',html:r=>r.is_system?'Yes':'No'}]),btn('new-account','+ Custom ledger'));
}
async function renderDrafts(){
 const [drafts,accounts]=await Promise.all([api(`${C()}/drafts`),api(`${C()}/accounts`)]);
 state.accounts=accounts;
 const pending=drafts.filter(r=>r.status==='PENDING');
 $('content').innerHTML=panel('Journal drafts awaiting review',
   '<p class="note">Drafts do not affect your accounts until authorized approval. Review account, amount and narration before approval.</p>'+
   table(drafts,[{key:'date',label:'Date'},{key:'memo',label:'Narration'},{key:'status',label:'Status'},
     {label:'Actions',html:r=>r.status==='PENDING'?btn(`approve-draft:${r.id}`,'Approve','tiny')+' '+btn(`reject-draft:${r.id}`,'Reject','tiny red'):'Reviewed'}]),
   btn('new-draft','+ Create journal draft','primary'));
}
function newDraftForm(){
 const fields=input('date','Date',{type:'date',value:new Date().toISOString().slice(0,10),required:true})+
  input('memo','Narration',{required:true})+
  select('debit_account','Debit account',state.accounts,'id','name')+
  select('credit_account','Credit account',state.accounts,'id','name')+
  input('amount_rupees','Amount ₹',{type:'number',step:'0.01',min:'0.01',required:true});
 openModal('Create unposted journal draft',form('create-draft',fields,'Submit for review'));
}
function signedPaise(value){
 const str=String(value??'').trim();
 if(!/^-?\d+(?:\.\d{1,2})?$/.test(str))throw Error('Enter signed rupees, e.g. 500.00 or -250.00');
 const negative=str.startsWith('-'),abs=negative?str.slice(1):str;
 const n=paise(abs);if(!n)throw Error('Amount must not be zero');return negative?-n:n;
}
async function renderBanking(){
 const accounts=await api(`${C()}/accounts`);
 const banks=accounts.filter(a=>a.type==='ASSET'&&(a.code==='1010'||/bank/i.test(a.name)));
 if(!banks.length){$('content').innerHTML=panel('Bank reconciliation','Create a Bank asset ledger first.');return;}
 if(!banks.some(a=>a.id===state.bankAccountId))state.bankAccountId=banks[0].id;
 const accountId=state.bankAccountId;
 const [statement,candidates]=await Promise.all([
  api(`${C()}/banking/${encodeURIComponent(accountId)}/statement`),
  api(`${C()}/banking/${encodeURIComponent(accountId)}/candidates`)]);
 state.bankCandidates=candidates;
 const pending=statement.filter(line=>!line.matched_journal_line_id);
 const bankPicker=`<label>Bank ledger<select id="bank-ledger">${banks.map(a=>`<option value="${safe(a.id)}" ${a.id===accountId?'selected':''}>${safe(a.code)} — ${safe(a.name)}</option>`).join('')}</select></label>`;
 const importForm=`<form data-action="bank-import" class="form-grid">
  ${input('date','Statement date',{type:'date',value:new Date().toISOString().slice(0,10),required:true})}
  ${input('reference','Statement reference',{required:true})}
  ${input('amount_rupees','Deposit (+) / withdrawal (-) in ₹',{required:true,placeholder:'500.00 or -250.00'})}
  ${input('description','Description',{placeholder:'Optional'})}
  <div class="wide"><button class="btn primary" type="submit">Import statement line</button></div></form>`;
 const statementRows=table(statement,[
  {key:'date',label:'Date'},
  {key:'external_id',label:'Reference'},
  {label:'Amount',html:r=>safe((r.amount_paise<0?'-':'')+money(Math.abs(r.amount_paise)))},
  {label:'Status',html:r=>r.matched_journal_line_id?'Matched':'Unmatched'},
  {label:'Action',html:r=>{
    if(r.matched_journal_line_id)return btn(`bank-unmatch:${r.id}`,'Unmatch','tiny');
    const matches=candidates.filter(x=>x.amount_paise===r.amount_paise);
    return matches.length?`<div class="inline"><select aria-label="Posted bank ledger entry" id="candidate-${safe(r.id)}">${matches.map(x=>`<option value="${safe(x.id)}">${safe(x.date+' '+(x.reference||x.kind||'Entry')+' — '+money(Math.abs(x.amount_paise)))}</option>`).join('')}</select>${btn(`bank-match:${r.id}`,'Match','tiny')}</div>`:'No equal unlinked bank ledger entry';
  }}]);
 $('content').innerHTML=panel('Choose bank ledger',bankPicker)+
   panel('Add statement evidence',importForm)+
   panel(`Imported statement lines (${pending.length} unmatched)`,statementRows)+
   '<p class="note warn">Import and matching DO NOT move real money or post journal entries. Match only genuine bank movements. An authorized accountant must review reconciliations.</p>';
 $('bank-ledger').addEventListener('change',e=>{state.bankAccountId=e.target.value;showPage('banking');});
}
async function renderReports(){
 $('content').innerHTML=panel('Select a financial report',`<div class="inline"><label>Report type<select id="report-type"><option value="profit-loss">Profit & Loss</option><option value="balance-sheet">Balance Sheet</option><option value="trial-balance">Trial Balance</option><option value="gst">GST Draft</option><option value="stock">Stock Valuation</option><option value="outstanding">Outstanding Invoices</option><option value="daybook">Day Book</option></select></label>
 <label>From<input type="date" id="report-from" value="${new Date().getFullYear()}-01-01"></label><label>To<input type="date" id="report-to" value="${new Date().toISOString().slice(0,10)}"></label><button class="btn primary" type="button" data-action-button="run-report">Generate report</button></div><p class="note">All report figures use saved vouchers; reports show no fake demo balances.</p>`)+`<div id="report-results"></div>`;
 await showReport();
}
function reportTable(obj){
 if(Array.isArray(obj))return table(obj,obj.length?Object.keys(obj[0]).map(key=>({key,label:key,html:r=>key.endsWith('_paise')?money(r[key]):safe(typeof r[key]==='object'?JSON.stringify(r[key]):r[key])})):[]);
 if(obj&&typeof obj==='object')return Object.entries(obj).map(([key,val])=>{
  if(Array.isArray(val))return panel(key,reportTable(val));
  if(val&&typeof val==='object')return panel(key,reportTable([val]));
  return `<div class="item"><span>${safe(key.replaceAll('_',' '))}</span><strong>${key.endsWith('_paise')?money(val):safe(val)}</strong></div>`;
 }).join('');return safe(obj);
}
async function showReport(){const target=$('report-results');if(!target)return;
 try{const type=$('report-type').value,from=$('report-from').value,to=$('report-to').value;
  const result=await api(`${C()}/reports/${type}?from=${from}&to=${to}`);
  target.innerHTML=panel('Report results',reportTable(result));
 }catch(e){target.innerHTML=`<p class="error">${safe(e.message)}</p>`;}
}
async function renderSpreadsheets(){
 const books=await api(`${C()}/workbooks`);
 $('content').innerHTML=panel('Saved workbooks',table(books,[{key:'title',label:'Title'},{key:'updated_at',label:'Updated'},{label:'Open',html:r=>btn(`workbook:${r.id}`,'Open','tiny')}]),btn('new-workbook','+ New workbook','primary'))+
 `<p class="note">Working limited spreadsheet formulas: SUM, COUNT, AVERAGE, MIN, MAX, ABS, ROUND, arithmetic and cell ranges. Not a full Microsoft Excel replacement. Spreadsheet entries never post official accounting transactions.</p>`;
}
async function renderAssistant(){
 const co=state.companies.find(c=>c.id===state.companyId)||{};
 const chips=[['How much profit?','Profit'],['What is my cash balance?','Cash / Bank'],['Which products are low stock?','Low stock'],['How much customer payment is due?','Customer dues'],['Show my GST summary','GST']].map(([q,l])=>`<button type="button" class="btn tiny" data-action-button="chat:${safe(q)}">${safe(l)}</button>`).join(' ');
 const shortcuts=[['quick-sale','New sale'],['quick-purchase','New purchase'],['new-contact','Add customer / supplier'],['new-product','Add product']].map(([a,l])=>btn(a,l,'tiny')).join(' ');
 const welcome=state.chat.length?'':`<div class="bubble bot">Namaste! ${safe(co.name||'Your business')} is ready${co.gst_type==='UNREGISTERED'?' (without GST registration)':''}. Ask me about profit, cash, stock, dues or GST. I only read your records; I never post entries by myself.</div>`;
 $('content').innerHTML=panel('Ask about your business',`<div id="chat-history">${welcome}${state.chat.map(m=>`<div class="bubble ${m.role==='user'?'me':'bot'}">${safe(m.text)}</div>`).join('')}</div>
 <div class="quick-actions">${chips}</div>
 <form data-action="ask-ai" class="inline"><input name="message" maxlength="1500" placeholder="Example: How much profit? Which products are low stock?" required><button class="btn primary" type="submit">Ask</button></form>
 <div class="quick-actions">${shortcuts}</div>`)+
 `<p class="note">Only account records are used for totals. No uploaded data is sent to any AI service. Chat cannot silently post entries.</p>`;
 $('chat-history').scrollTop=$('chat-history').scrollHeight;
}
async function renderSubscriptions(){
 const data=await api(`${C()}/subscription`);
 $('content').innerHTML=panel('Current subscription',`<p><strong>Plan:</strong> ${safe(data.subscription.plan)} · <strong>Status:</strong> ${safe(data.subscription.status)}</p><p class="note warn">${safe(data.notice)}</p>`)+
 panel('Subscription plan catalog (prices not activated)',table(data.plans,[{key:'title',label:'Plan'},{label:'Monthly price',html:r=>r.monthly_paise===null?'Not configured':money(r.monthly_paise)},{label:'AI credits',html:r=>r.ai_credits===null?'Not configured':String(r.ai_credits)}]));
}
async function renderSettings(){
 const company=await api(`${C()}`);
 const current=state.companies.find(c=>c.id===state.companyId);
 let memberHTML='';if(current.role==='OWNER'){
  const members=await api(`${C()}/members`);
  memberHTML=panel('Team permissions',table(members,[{key:'name',label:'Name'},{key:'email',label:'Email'},{key:'role',label:'Role'}]),btn('add-staff','+ Add registered user'));
 }
 $('content').innerHTML=panel('Company profile',`<div class="item"><span>Name</span><strong>${safe(company.name)}</strong></div><div class="item"><span>State code</span><strong>${safe(company.state_code)}</strong></div><div class="item"><span>GSTIN</span><strong>${safe(company.gstin||'Not configured')}</strong></div><div class="item"><span>Your role</span><strong>${safe(current.role)}</strong></div>`,current.role==='OWNER'?btn('edit-company','Edit company'): '')+memberHTML+
 panel('Email and password',`<p>Signed in as <strong>${safe(state.user.email)}</strong>. Each user chooses their own password during registration.</p>${btn('change-password','Change my password','primary')}<p class="muted small">Forgot password uses email when your administrator configures a verified sender.</p>`)+
 panel('Account data','<p>Data and company files are stored on this laptop in the <code>data/</code SQLite database. Back it up while the server is stopped. Do not expose this local development server to the internet without a security review.</p>');
}
const STATES=[['01','Jammu & Kashmir'],['02','Himachal Pradesh'],['03','Punjab'],['04','Chandigarh'],['05','Uttarakhand'],['06','Haryana'],['07','Delhi'],['08','Rajasthan'],['09','Uttar Pradesh'],['10','Bihar'],['11','Sikkim'],['12','Arunachal Pradesh'],['13','Nagaland'],['14','Manipur'],['15','Mizoram'],['16','Tripura'],['17','Meghalaya'],['18','Assam'],['19','West Bengal'],['20','Jharkhand'],['21','Odisha'],['22','Chhattisgarh'],['23','Madhya Pradesh'],['24','Gujarat'],['26','Dadra & Nagar Haveli and Daman & Diu'],['27','Maharashtra'],['29','Karnataka'],['30','Goa'],['31','Lakshadweep'],['32','Kerala'],['33','Tamil Nadu'],['34','Puducherry'],['35','Andaman & Nicobar'],['36','Telangana'],['37','Andhra Pradesh'],['38','Ladakh']];
function showCompanyModal(){
 const states=STATES.map(([c,n])=>`<option value="${c}" ${c==='09'?'selected':''}>${n} (${c})</option>`).join('');
 openModal('Create your business',form('create-company',
  input('name','Business name',{required:true})+
  `<label>Business type<select name="business_type"><option>Retail / Shop</option><option>Wholesale</option><option>Services</option><option>Manufacturing</option><option>Other</option></select></label>`+
  `<label>Business state / UT<select name="state_code" required>${states}</select></label>`+
  `<label>GST registration<select name="gst_type" id="gst-type-select"><option value="UNREGISTERED">I do not have GST registration</option><option value="REGULAR">GST Regular</option><option value="COMPOSITION">GST Composition</option><option value="OTHER">Other GST registration</option></select></label>`+
  `<div class="wide" id="gstin-wrap" style="display:none">${input('gstin','GSTIN (15 characters; first 2 digits = state code)')}</div>`+
  `<p class="note wide" id="gst-note">GSTIN is not needed. You can create your business without GST registration; invoices will have no GST.</p>`+
  input('address','Address (optional)'),'Create business'));
 const sel=$('gst-type-select');
 sel.addEventListener('change',()=>{const reg=sel.value!=='UNREGISTERED';$('gstin-wrap').style.display=reg?'':'none';const g=$('gstin-wrap').querySelector('input');g.required=reg;if(!reg)g.value='';$('gst-note').style.display=reg?'none':'';});
}
async function openInvoice(kind){
 const [contacts,products]=await Promise.all([api(`${C()}/contacts?kind=${kind==='SALE'?'CUSTOMER':'SUPPLIER'}`),api(`${C()}/products`)]);
 if(!contacts.length||!products.length){toast('First create a matching customer/supplier and a product');return;}
 state.draftItems=[];state.invoiceKind=kind;
 openModal(kind==='SALE'?'Create sales invoice':'Create purchase invoice',`
 <form data-action="invoice" id="invoice-form"><div class="form-grid">
 ${select('contact_id','Customer / Supplier',contacts)}${input('date','Invoice date',{type:'date',value:new Date().toISOString().slice(0,10),required:true})}
 ${select('product_id','Product',products)}${input('qty','Quantity (whole units)',{type:'number',min:1,value:1,required:true})}
 ${input('unit_rupees','Unit price (₹)',{type:'number',min:0,step:'0.01',value:rupees(kind==='SALE'?products[0].sale_price_paise:products[0].cost_price_paise),required:true})}
 ${input('discount_rupees','Discount for this line (₹)',{type:'number',min:0,step:'0.01',value:'0.00'})}
 <div class="wide"> <button class="btn soft" type="button" id="append-item">+ Add this item</button><div id="draft-items" class="item-list"></div></div>
 ${input('paid_rupees','Paid now (₹)',{type:'number',min:0,step:'0.01',value:'0.00',required:true})}
 <label>Paid using<select name="payment_method"><option value="CASH">Cash</option><option value="BANK">Bank</option></select></label>
 </div><p class="note">GST comes from each product rate; intra/inter-state depends on saved company and contact state codes. Confirm applicable classification and ITC with an accountant.</p>
 <button class="btn primary" type="submit">Confirm and post invoice</button></form>`);
 const f=$('invoice-form'),p=f.elements.product_id;
 p.addEventListener('change',()=>{const r=products.find(x=>x.id===p.value);if(r)f.elements.unit_rupees.value=rupees(kind==='SALE'?r.sale_price_paise:r.cost_price_paise);});
 $('append-item').addEventListener('click',()=>{try{const qty=Number(f.elements.qty.value);if(!Number.isSafeInteger(qty)||qty<1)throw Error('Use a positive whole-number quantity');const product=products.find(x=>x.id===p.value);
  state.draftItems.push({product_id:p.value,qty,unit_paise:paise(f.elements.unit_rupees.value),discount_paise:paise(f.elements.discount_rupees.value),name:product.name});
  $('draft-items').innerHTML=state.draftItems.map((x,i)=>`<div class="item"><span>${safe(x.name)} × ${x.qty} · ${money(x.unit_paise)} each</span><button type="button" class="btn tiny red" data-action-button="remove-item:${i}">Remove</button></div>`).join('');
 }catch(e){err(e);}});
}
function contactForm(){openModal('Add contact',form('create-contact',`<label>Type<select name="kind"><option value="CUSTOMER">Customer</option><option value="SUPPLIER">Supplier</option></select></label>`+input('name','Full name',{required:true})+input('state_code','GST state code (optional)',{placeholder:'27'})+input('gstin','GSTIN (optional)')+input('phone','Phone')+input('email','Email')));}
function productForm(){openModal('Add product',form('create-product',input('sku','SKU / Product code',{required:true})+input('name','Product name',{required:true})+input('hsn','HSN / SAC')+input('gst_rate','GST rate % (verify for your product)',{type:'number',value:'18',step:'0.01',min:0,required:true})+input('sale_rupees','Sale price ₹',{type:'number',value:'100',step:'0.01',min:0,required:true})+input('cost_rupees','Purchase cost ₹',{type:'number',value:'70',step:'0.01',min:0,required:true})+input('reorder_level','Low-stock alert at quantity',{type:'number',value:5,min:0,required:true})));}
async function journalForm(){const acc=await api(`${C()}/accounts`);state.accounts=acc;
 openModal('Manual double-entry journal',form('new-journal',input('date','Journal date',{type:'date',value:new Date().toISOString().slice(0,10),required:true})+input('memo','Narration',{required:true})+select('debit_account','Debit account',acc,'id','name')+select('credit_account','Credit account',acc,'id','name')+input('amount_rupees','Amount ₹',{type:'number',step:'0.01',min:'0.01',required:true}), 'Post balanced journal')+'<p class="note warn">Only use this when you understand both sides of the entry. Correct finalized journals by reversal.</p>');
}
function reportInvoiceDetails(inv){
 return `<div class="item"><span>Invoice</span><strong>${safe(inv.number)}</strong></div>`+
 table(inv.items,[{key:'product_name',label:'Product'},{key:'qty',label:'Qty'},{label:'Price',html:x=>money(x.unit_paise)},{label:'Taxable',html:x=>money(x.taxable_paise)},{label:'CGST',html:x=>money(x.cgst_paise)},{label:'SGST',html:x=>money(x.sgst_paise)},{label:'IGST',html:x=>money(x.igst_paise)},{label:'Total',html:x=>money(x.total_paise)}])+`<div class="item"><span>Invoice total</span><strong>${money(inv.total_paise)}</strong></div>`+
 panel('Payment history',table(inv.payments,[{key:'date',label:'Date'},{key:'method',label:'Method'},{label:'Amount',html:x=>money(x.amount_paise)}]));
}
async function handleClick(action){try{
 if(action==='retry-page')return showPage(state.page);
 if(action.startsWith('chat:')){const message=action.slice(5);state.chat.push({role:'user',text:message});const result=await api(`${C()}/assistant`,{method:'POST',body:{message}});state.chat.push({role:'bot',text:result.reply});return showPage('assistant');}
 if(action==='open-company')return showCompanyModal();
 if(action==='change-password')return openModal('Change your password',form('change-password',
   input('current_password','Current password',{type:'password',required:true})+
   input('new_password','New password (8+ characters)',{type:'password',required:true})+
   input('repeat_password','Confirm new password',{type:'password',required:true}),'Change password'));
 if(action==='add-file')return $('file-picker')?.click();
 if(action==='record-voice')return await startVoice();
 if(action==='stop-voice')return stopVoice();
 if(action.startsWith('open-file:'))return await openStoredFile(action.slice(10));
 if(action.startsWith('download-file:'))return await openStoredFile(action.slice(14),true);
 if(action.startsWith('delete-file:')){
  if(!confirm('Permanently delete this saved file from this company?'))return;
  await api(`${C()}/documents/${encodeURIComponent(action.slice(12))}`,{method:'DELETE',body:{}});
  toast('Document deleted');return showPage('files');
 }
 if(action==='record-transaction')return openModal('Record a transaction',`<p class="note">Choose a transaction type. All accounting changes use the existing validated services.</p><div class="quick-actions"><button type="button" class="btn primary" data-action-button="quick-sale">New sales invoice</button><button type="button" class="btn" data-action-button="quick-purchase">New purchase invoice</button><button type="button" class="btn" data-action-button="quick-capital">Owner capital</button><button type="button" class="btn" data-action-button="quick-journal">Journal entry</button></div>`);
 if(action.startsWith('quick-')){closeModal();return handleClick(({ 'quick-sale':'new-sale','quick-purchase':'new-purchase','quick-capital':'new-capital','quick-journal':'new-journal'})[action]);}

 if(action.startsWith('bank-match:')||action.startsWith('bank-unmatch:')){
  const matching=action.startsWith('bank-match:');const id=action.split(':')[1];
  if(!window.confirm(matching?'Match this bank transaction to the selected posted ledger entry?':'Unmatch this bank transaction?'))return;
  const body=matching?{statement_id:id,journal_line_id:$('candidate-'+id)?.value}:{statement_id:id};
  if(matching&&!body.journal_line_id)throw Error('Select a ledger entry to match');
  await api(`${C()}/banking/${encodeURIComponent(state.bankAccountId)}/${matching?'match':'unmatch'}`,{method:'POST',body});
  toast(matching?'Bank line matched':'Bank line unmatched');return showPage('banking');
 }
 if(action.startsWith('full-return:')){
  const invoiceId=action.slice('full-return:'.length);
  const original=await api(`${C()}/invoices/${encodeURIComponent(invoiceId)}`);
  if(!window.confirm(`Create a FULL ${original.kind==='SALE'?'sales credit note':'purchase debit note'} for ${original.number}? Only unpaid invoices are supported. This posts reversing ledger and stock entries; no cash is refunded. Confirm only after checking the original invoice.`))return;
  const result=await api(`${C()}/invoices/${encodeURIComponent(invoiceId)}/full-return`,{method:'POST',body:{date:new Date().toISOString().slice(0,10)}});
  toast(`${result.kind} ${result.number} posted`);return showPage('returns');
 }
 if(action==='new-contact')return contactForm();
 if(action==='new-product')return productForm();
 if(action==='new-sale'||action==='new-purchase')return openInvoice(action==='new-sale'?'SALE':'PURCHASE');
 if(action==='new-journal')return journalForm();
  if(action==='new-draft')return newDraftForm();
  if(action.startsWith('approve-draft:')||action.startsWith('reject-draft:')){
   const approve=action.startsWith('approve-draft:');
   const draftId=action.split(':')[1];
   if(!window.confirm(approve?'Approve and POST this draft to the actual ledger?':'Reject this draft without posting?'))return;
   await api(`${C()}/drafts/${encodeURIComponent(draftId)}/${approve?'approve':'reject'}`,{method:'POST',body:{}});
   toast(approve?'Draft approved and posted':'Draft rejected');return showPage('drafts');
  }
 if(action==='new-capital')return openModal('Record owner capital',form('new-capital',input('date','Date',{type:'date',value:new Date().toISOString().slice(0,10),required:true})+input('amount_rupees','Capital invested ₹',{type:'number',min:'0.01',step:'0.01',required:true})+`<label>Account<select name="method"><option value="CASH">Cash</option><option value="BANK">Bank</option></select></label>`,'Record capital'));
 if(action==='new-account')return openModal('Create ledger',form('new-account',input('code','Account code',{required:true})+input('name','Ledger name',{required:true})+`<label>Account type<select name="type"><option>ASSET</option><option>LIABILITY</option><option>EQUITY</option><option>REVENUE</option><option>EXPENSE</option></select></label>`));
 if(action==='add-staff')return openModal('Add existing registered user',form('add-staff',input('email','User email',{type:'email',required:true})+`<label>Role<select name="role"><option>ACCOUNTANT</option><option>MANAGER</option><option>SALES</option><option>VIEWER</option></select></label>`));
 if(action==='edit-company'){const d=await api(C());return openModal('Edit company',form('edit-company',input('name','Name',{value:d.name,required:true})+input('gstin','GSTIN',{value:d.gstin||''})+input('address','Address',{value:d.address||''})));}
 if(action==='run-report')return showReport();
 if(action==='export-invoices')return window.location.assign(`${C()}/export/invoices`);
 if(action.startsWith('remove-item:')){state.draftItems.splice(Number(action.split(':')[1]),1);$('draft-items').innerHTML=state.draftItems.map((x,i)=>`<div class="item">${safe(x.name)} × ${x.qty} <button class="btn tiny red" type="button" data-action-button="remove-item:${i}">Remove</button></div>`).join('');return;}
 if(action.startsWith('view-invoice:')){const row=await api(`${C()}/invoices/${action.split(':')[1]}`);return openModal('Invoice details',reportInvoiceDetails(row));}
 if(action.startsWith('view-voucher:')){const row=await api(`${C()}/vouchers/${action.split(':')[1]}`);return openModal('Voucher details',`<p>${safe(row.kind)} — ${safe(row.date)} — ${safe(row.reference)}</p>`+table(row.lines,[{key:'code',label:'Code'},{key:'name',label:'Ledger'},{label:'Debit',html:r=>money(r.debit_paise)},{label:'Credit',html:r=>money(r.credit_paise)}])+(row.kind==='JOURNAL'?btn(`reverse-voucher:${row.id}`,'Reverse this journal','red'):''));}
 if(action.startsWith('reverse-voucher:')){if(!window.confirm('Reverse this journal with a new, balanced reversing entry?'))return;await api(`${C()}/vouchers/${action.split(':')[1]}/reverse`,{method:'POST',body:{}});closeModal();toast('Reversal entry posted');return showPage('journal');}
 if(action.startsWith('pay-invoice:')){const row=await api(`${C()}/invoices/${action.split(':')[1]}`);const total=row.total_paise-row.payments.reduce((s,p)=>s+p.amount_paise,0);
 return openModal(`Record ${row.kind==='SALE'?'customer receipt':'supplier payment'}`,form(`settle:${row.id}`,`<p class="wide">Outstanding: <strong>${money(total)}</strong></p>`+input('date','Date',{type:'date',value:new Date().toISOString().slice(0,10),required:true})+input('amount_rupees','Amount ₹',{type:'number',step:'0.01',min:'0.01',value:rupees(total),required:true})+`<label>Payment method<select name="method"><option>CASH</option><option>BANK</option></select></label>`,'Post payment'));}
 if(action==='new-workbook')return openModal('Create workbook',form('new-workbook',input('title','Workbook title',{required:true})+`<label class="wide">Cells as JSON<textarea name="cells_json">{"A1": 10, "A2": 20, "A3": "=SUM(A1:A2)"}</textarea></label>`));
 if(action.startsWith('workbook:')){const row=await api(`${C()}/workbooks/${action.split(':')[1]}`);
 return openModal(`Workbook: ${row.title}`,form(`edit-workbook:${row.id}`,`<label class="wide">Editable cells (JSON)<textarea name="cells_json" rows="13">${safe(JSON.stringify(row.cells,null,2))}</textarea></label>`,'Recalculate & save')+`<h3>Calculated results</h3><pre class="code">${safe(JSON.stringify(row.results,null,2))}</pre>`);}
 }catch(e){err(e);}}
async function handleForm(f){const action=f.dataset.action;const fd=new FormData(f);const get=k=>fd.get(k);let body,endpoint,method='POST',dest=state.page;
 try{
  if(action==='forgot-password'){
   const result=await api('/api/auth/forgot-password',{method:'POST',body:{email:get('email')}});
   closeModal();toast(result.message);return;
  }
  if(action==='reset-password'){
   if(get('new_password')!==get('repeat_password'))throw Error('Passwords do not match');
   await api('/api/auth/reset-password',{method:'POST',body:{token:get('reset_token'),new_password:get('new_password')}});
   history.replaceState({},'',location.pathname+location.search);
   closeModal();toast('Password reset. Please log in again.');return;
  }
  if(action==='change-password'){
   if(get('new_password')!==get('repeat_password'))throw Error('New passwords do not match');
   await api('/api/auth/change-password',{method:'POST',body:{current_password:get('current_password'),new_password:get('new_password')}});
   closeModal();toast('Password updated. Other sessions signed out.');return;
  }
  if(action==='bank-import'){
   const line={date:get('date'),reference:get('reference'),description:get('description'),
    amount_paise:signedPaise(get('amount_rupees'))};
   if(!line.reference?.trim())throw Error('Statement reference is required');
   const result=await api(`${C()}/banking/${encodeURIComponent(state.bankAccountId)}/statement`,{method:'POST',body:{lines:[line]}});
   toast(result.created?'Statement line imported':'This statement line is already imported');
   return showPage('banking');
  }
  if(action==='create-company'){endpoint='/api/companies';body={name:get('name'),state_code:get('state_code'),gst_type:get('gst_type'),gstin:get('gstin'),address:get('address')};}
  else if(action==='create-contact'){endpoint=`${C()}/contacts`;body={kind:get('kind'),name:get('name'),state_code:get('state_code'),gstin:get('gstin'),phone:get('phone'),email:get('email')};}
  else if(action==='create-product'){endpoint=`${C()}/products`;body={sku:get('sku'),name:get('name'),hsn:get('hsn'),gst_bps:Math.round(Number(get('gst_rate'))*100),sale_price_paise:paise(get('sale_rupees')),cost_price_paise:paise(get('cost_rupees')),reorder_level:Number(get('reorder_level'))};}
  else if(action==='invoice'){
   if(!state.draftItems.length)throw Error('Click Add this item first');
   endpoint=`${C()}/invoices`;body={kind:state.invoiceKind,contact_id:get('contact_id'),date:get('date'),items:state.draftItems.map(({product_id,qty,unit_paise,discount_paise})=>({product_id,qty,unit_paise,discount_paise})),paid_paise:paise(get('paid_rupees')),payment_method:get('payment_method'),idempotency_key:crypto.randomUUID()};dest='invoices';
  }
  else if(action.startsWith('settle:')){endpoint=`${C()}/invoices/${action.slice(7)}/payments`;body={date:get('date'),amount_paise:paise(get('amount_rupees')),method:get('method'),idempotency_key:crypto.randomUUID()};dest='invoices';}
  else if(action==='new-capital'){endpoint=`${C()}/capital`;body={date:get('date'),amount_paise:paise(get('amount_rupees')),method:get('method'),idempotency_key:crypto.randomUUID()};}
   else if(action==='create-draft'){
    endpoint=`${C()}/drafts`;const n=paise(get('amount_rupees'));
    if(get('debit_account')===get('credit_account'))throw Error('Choose different accounts');
    body={date:get('date'),memo:get('memo'),lines:[
     {account_id:get('debit_account'),debit_paise:n,credit_paise:0},
     {account_id:get('credit_account'),debit_paise:0,credit_paise:n}]};dest='drafts';
   }
  else if(action==='new-journal'){endpoint=`${C()}/vouchers`;const n=paise(get('amount_rupees'));
   if(get('debit_account')===get('credit_account'))throw Error('Choose different debit and credit accounts');
   body={date:get('date'),memo:get('memo'),idempotency_key:crypto.randomUUID(),lines:[{account_id:get('debit_account'),debit_paise:n,credit_paise:0},{account_id:get('credit_account'),debit_paise:0,credit_paise:n}]};}
  else if(action==='new-account'){endpoint=`${C()}/accounts`;body={code:get('code'),name:get('name'),type:get('type')};}
  else if(action==='add-staff'){endpoint=`${C()}/members`;body={email:get('email'),role:get('role')};}
  else if(action==='edit-company'){endpoint=C();method='PATCH';body={name:get('name'),gstin:get('gstin'),address:get('address')};}
  else if(action==='new-workbook'){endpoint=`${C()}/workbooks`;body={title:get('title'),cells:JSON.parse(get('cells_json'))};}
  else if(action.startsWith('edit-workbook:')){endpoint=`${C()}/workbooks/${action.slice(14)}`;method='PATCH';body={cells:JSON.parse(get('cells_json'))};}
  else if(action==='ask-ai'){
   const message=get('message');state.chat.push({role:'user',text:message});const result=await api(`${C()}/assistant`,{method:'POST',body:{message}});state.chat.push({role:'bot',text:result.reply});await showPage('assistant');return;
  }
  else return;
  f.querySelector('button[type=submit]').disabled=true;
  const result=await api(endpoint,{method,body});toast(result.number?`Saved invoice ${result.number}`:'Saved successfully');
  closeModal();if(action==='create-company'){state.companyId=result.id;state.chat=[];state.page='assistant';await loadCompanies();}else{if(action==='edit-company')await loadCompanies();else await showPage(dest);}
 }catch(e){err(e);const submit=f.querySelector('button[type=submit]');if(submit)submit.disabled=false;}
}
$('auth-form').addEventListener('submit',async event=>{
 event.preventDefault();const f=event.currentTarget;const data=Object.fromEntries(new FormData(f));
 $('auth-error').textContent='';try{
  if(state.authMode==='register'){
   if(data.password!==data.confirm_password)throw Error('Passwords do not match');
   delete data.confirm_password;
   await api('/api/auth/register',{method:'POST',body:data});state.authMode='login';setAuthMode('login');toast('Account created. Log in with your email and password.');
  }
  else{const session=await api('/api/auth/login',{method:'POST',body:data});await signedIn(session);}
 }catch(e){$('auth-error').textContent=e.message;}
});
function setAuthMode(mode){state.authMode=mode;
 $('login-tab').classList.toggle('active',mode==='login');$('register-tab').classList.toggle('active',mode==='register');
 $('name-field').hidden=mode!=='register';$('name-field').querySelector('input').required=mode==='register';
 $('confirm-field').hidden=mode!=='register';$('confirm-field').querySelector('input').required=mode==='register';
 $('auth-password').autocomplete=mode==='register'?'new-password':'current-password';
 $('auth-submit').textContent=mode==='login'?'Login':'Create account';
 $('auth-error').textContent='';
}
$('forgot-pass').addEventListener('click',()=>openModal('Reset your password',form('forgot-password',
 input('email','Registered email',{type:'email',required:true}), 'Send reset link')+'<p class="note">Email recovery requires a configured provider. No password is sent in email.</p>'));
$('login-tab').addEventListener('click',()=>setAuthMode('login'));
$('register-tab').addEventListener('click',()=>setAuthMode('register'));
$('auth-show-pass').addEventListener('click',()=>{const pass=$('auth-password');const visible=pass.type==='text';pass.type=visible?'password':'text';$('auth-show-pass').textContent=visible?'Show':'Hide';$('auth-show-pass').setAttribute('aria-label',visible?'Show password':'Hide password');});
$('add-company').addEventListener('click',showCompanyModal);
$('close-modal').addEventListener('click',closeModal);
$('modal-backdrop').addEventListener('click',e=>{if(e.target===$('modal-backdrop'))closeModal();});
$('company-select').addEventListener('change',e=>{state.companyId=e.target.value;showPage('dashboard');});
$('nav').addEventListener('click',e=>{const button=e.target.closest('button[data-page]');if(button)showPage(button.dataset.page);});
$('menu').addEventListener('click',()=>document.querySelector('.sidebar').classList.toggle('open'));
$('logout').addEventListener('click',async()=>{try{await api('/api/auth/logout',{method:'POST',body:{}});}catch{}state.user=null;state.csrf='';state.companyId=null;state.chat=[];loginUI();});
document.addEventListener('click',e=>{const button=e.target.closest('button[data-action-button]');if(button)handleClick(button.dataset.actionButton);});
document.addEventListener('submit',e=>{const f=e.target.closest('form[data-action]');if(f){e.preventDefault();handleForm(f);}});
(async()=>{try{const session=await api('/api/auth/me');await signedIn(session);}catch{loginUI();}})();

// Reset links place tokens in the URL fragment; never log or expose them to page requests.
try{
 const fragment=new URLSearchParams(location.hash.replace(/^#/,''));const token=fragment.get('reset');
 if(token&&/^[a-f0-9]{64}$/.test(token)){
  openModal('Choose a new password',form('reset-password',
   `<input name="reset_token" type="hidden" value="${safe(token)}">`+
   input('new_password','New password',{type:'password',required:true,minlength:8})+
   input('repeat_password','Confirm password',{type:'password',required:true,minlength:8}),'Reset password'));
 }
}catch(e){console.warn('Unable to open password reset form',e);}

// Visual preferences only; accounting records are never written to browser storage.
function applyTheme(mode){
 const next=mode==='dark'?'dark':'light';document.documentElement.dataset.theme=next;
 const button=$('theme-toggle');if(button){button.setAttribute('aria-label',next==='dark'?'Switch to light mode':'Switch to dark mode');button.querySelector('use')?.setAttribute('href',next==='dark'?'#i-sun':'#i-moon');}
}
try{applyTheme(localStorage.getItem('apna-business-theme')||'light');}catch{applyTheme('light');}
$('theme-toggle').addEventListener('click',()=>{const next=document.documentElement.dataset.theme==='dark'?'light':'dark';applyTheme(next);try{localStorage.setItem('apna-business-theme',next);}catch{}});
