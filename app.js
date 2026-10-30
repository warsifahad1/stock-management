const DB_NAME = "local-stock-db", DB_VERSION = 1;
let db;
const $ = id => document.getElementById(id);
const fmt = n => Number(n).toLocaleString(undefined,{maximumFractionDigits:3});
function toast(msg){const el=$("toast");el.textContent=msg;el.style.display="block";clearTimeout(toast.t);toast.t=setTimeout(()=>el.style.display="none",2800)}
function openDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,DB_VERSION);req.onupgradeneeded=()=>{const d=req.result;d.createObjectStore("products",{keyPath:"id"});d.createObjectStore("moves",{keyPath:"id"})};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
function all(store){return new Promise((resolve,reject)=>{const r=db.transaction(store).objectStore(store).getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
function put(store,value){return new Promise((resolve,reject)=>{const tx=db.transaction(store,"readwrite");tx.objectStore(store).put(value);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error)})}
function delAll(store){return new Promise((resolve,reject)=>{const tx=db.transaction(store,"readwrite");tx.objectStore(store).clear();tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
function uid(){return Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8)}
function dateText(v){return new Date(v).toLocaleString()}
async function render(){
 const products=(await all("products")).sort((a,b)=>a.name.localeCompare(b.name));
 const moves=(await all("moves")).sort((a,b)=>b.time-a.time);
 const low=products.filter(p=>p.qty<=p.minimum);
 $("productCount").textContent=products.length;
 $("totalQty").textContent=fmt(products.reduce((s,p)=>s+Number(p.qty||0),0));
 $("lowCount").textContent=low.length;
 $("lowAlert").hidden=!low.length;
 $("lowAlert").textContent=low.length?`Low stock: ${low.map(p=>p.name).join(", ")}. Reorder/produce stock soon.`:"";
 const q=$("search").value.trim().toLowerCase();
 const shown=products.filter(p=>(p.name+" "+p.type+" "+p.notes).toLowerCase().includes(q));
 $("productList").innerHTML=shown.map(p=>`<div class="product"><div><h3>${esc(p.name)}</h3><div class="meta">${esc(p.type)} · ${esc(p.unit)}<br>Alert limit: ${fmt(p.minimum)} ${esc(p.unit)}</div><span class="pill ${p.qty<=p.minimum?"low":""}">${p.qty<=p.minimum?"LOW STOCK":"IN STOCK"}</span></div><div class="qty">${fmt(p.qty)}<div class="meta">${esc(p.unit)}</div></div></div>`).join("");
 $("emptyProducts").hidden=shown.length>0;
 $("moveProduct").innerHTML=products.map(p=>`<option value="${p.id}">${esc(p.name)} — ${fmt(p.qty)} ${esc(p.unit)}</option>`).join("");
 $("moveProduct").disabled=!products.length;
 $("movementList").innerHTML=moves.slice(0,30).map(m=>`<div class="movement"><div><strong>${esc(m.productName)}</strong><div class="meta">${dateText(m.time)}${m.note?" · "+esc(m.note):""}</div></div><div class="${m.direction}">${m.direction==="in"?"+":"−"}${fmt(m.qty)}</div></div>`).join("")||'<p class="empty">Abhi movement history nahi hai.</p>';
}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll(".panel").forEach(p=>p.hidden=p.id!==b.dataset.tab);if(b.dataset.tab==="move")render()}));
$("search").addEventListener("input",render);
$("productForm").addEventListener("submit",async e=>{e.preventDefault();const f=new FormData(e.target);const name=String(f.get("name")).trim();if(!name)return;const product={id:uid(),name,type:f.get("type"),unit:String(f.get("unit")).trim(),qty:Number(f.get("qty")),minimum:Number(f.get("minimum")),notes:String(f.get("notes")||"").trim(),createdAt:Date.now()};await put("products",product);if(product.qty>0)await put("moves",{id:uid(),productId:product.id,productName:product.name,direction:"in",qty:product.qty,note:"Opening stock",time:Date.now()});e.target.reset();e.target.elements.unit.value="pcs";e.target.elements.qty.value="0";e.target.elements.minimum.value="10";await render();toast("Product save ho gaya");document.querySelector('[data-tab="stock"]').click()});
$("moveForm").addEventListener("submit",async e=>{e.preventDefault();const f=new FormData(e.target);const p=(await all("products")).find(x=>x.id===f.get("productId"));const qty=Number(f.get("qty"));const direction=f.get("direction");if(!p){toast("Pehle product add karo");return}if(!Number.isFinite(qty)||qty<=0){toast("Valid quantity enter karo");return}if(direction==="out"&&qty>p.qty){toast("Itna stock available nahi hai");return}p.qty=Number((p.qty+(direction==="in"?qty:-qty)).toFixed(6));await put("products",p);await put("moves",{id:uid(),productId:p.id,productName:p.name,direction,qty,note:String(f.get("note")||"").trim(),time:Date.now()});e.target.elements.qty.value="";e.target.elements.note.value="";await render();toast("Stock update ho gaya")});
$("exportBtn").addEventListener("click",async()=>{const data={app:"Local Stock",version:1,exportedAt:new Date().toISOString(),products:await all("products"),moves:await all("moves")};const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="local-stock-backup-"+new Date().toISOString().slice(0,10)+".json";a.click();URL.revokeObjectURL(url);toast("Backup download start ho gaya")});
$("importFile").addEventListener("change",async e=>{const file=e.target.files[0];if(!file)return;try{const data=JSON.parse(await file.text());if(data.app!=="Local Stock"||!Array.isArray(data.products)||!Array.isArray(data.moves))throw Error("Invalid backup");if(!confirm("Current data replace ho jayega. Continue?"))return;await delAll("products");await delAll("moves");for(const p of data.products){if(!p.id||typeof p.name!=="string"||!Number.isFinite(Number(p.qty)))throw Error("Invalid product data");await put("products",p)}for(const m of data.moves){if(!m.id)throw Error("Invalid movement data");await put("moves",m)}await render();toast("Backup restore ho gaya")}catch(err){alert("Backup restore nahi hua. Valid Local Stock JSON file select karo.")}finally{e.target.value=""}});
$("clearBtn").addEventListener("click",async()=>{if(!confirm("Saare products aur movement records permanently delete honge. Pehle backup liya hai?"))return;await delAll("products");await delAll("moves");await render();toast("App data delete ho gaya")});
if("serviceWorker" in navigator && location.protocol.startsWith("http"))navigator.serviceWorker.register("./sw.js").catch(()=>{});
(async()=>{try{db=await openDB();await render()}catch(e){alert("Local database open nahi hua. Is app ko supported browser mein open karein.")}})();