// Simple PWA for rituals + journaling with localStorage
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// --- Service Worker registration ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js');
  });
}

// --- Install button (Android/desktop; iOS uses "Add to Home Screen") ---
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = $('#installBtn');
  btn.hidden = false;
  btn.addEventListener('click', async () => {
    btn.hidden = true;
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
    }
  });
});

// --- Rituals ---
function todayKey(k){ 
  const d = new Date().toISOString().slice(0,10); 
  return `ritual:${k}:${d}`; 
}
function loadRituals(){
  $$('.ritual').forEach(cb => {
    cb.checked = localStorage.getItem(todayKey(cb.dataset.key)) === '1';
    cb.onchange = () => localStorage.setItem(todayKey(cb.dataset.key), cb.checked ? '1' : '0');
  });
}
$('#resetRituals').onclick = () => {
  $$('.ritual').forEach(cb => { cb.checked = false; localStorage.removeItem(todayKey(cb.dataset.key)); });
};

// --- Journal ---
function entryKey(id){ return `entry:${id}`; }
function listEntries(){
  const container = $('#entries');
  container.innerHTML = '';
  const keys = Object.keys(localStorage).filter(k=>k.startsWith('entry:'));
  keys.sort().reverse();
  for (const k of keys){
    const obj = JSON.parse(localStorage.getItem(k));
    if(!obj) continue;
    const div = document.createElement('div');
    div.className = 'entry';
    div.innerHTML = `<h3>${obj.title || 'Untitled'}</h3>
                     <time>${new Date(obj.ts).toLocaleString()}</time>
                     <p>${(obj.body||'').replace(/</g,'&lt;')}</p>`;
    container.appendChild(div);
  }
}
$('#saveEntry').onclick = () => {
  const title = $('#journalTitle').value.trim();
  const body = $('#journalBody').value.trim();
  if(!title && !body){ alert('Write something first 🙂'); return; }
  const id = Date.now();
  const data = { id, title, body, ts: new Date().toISOString() };
  localStorage.setItem(entryKey(id), JSON.stringify(data));
  $('#journalTitle').value=''; $('#journalBody').value='';
  listEntries();
};
$('#exportEntries').onclick = () => {
  const keys = Object.keys(localStorage).filter(k=>k.startsWith('entry:'));
  const arr = keys.map(k => JSON.parse(localStorage.getItem(k))).filter(Boolean);
  const blob = new Blob([JSON.stringify(arr, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'compass-house-journal.json';
  a.click();
  URL.revokeObjectURL(url);
};<!-- Journal Entry Form -->
<h2>New Journal Entry</h2>
<input id="journalTitle" type="text" placeholder="Title" />
<br><br>
<textarea id="journalBody" rows="6" cols="40" placeholder="Write your thoughts..."></textarea>
<br><br>
<button id="saveEntry">Save Entry</button>

<hr>

<h2>Saved Entries</h2>
<pre id="entriesLog"></pre>


// --- Settings (optional API) ---
function saveSettings(){
  const base = $('#apiBase').value.trim();
  localStorage.setItem('apiBase', base);
  log(`Saved API base: ${base || '(none)'}`);
}
function loadSettings(){
  $('#apiBase').value = localStorage.getItem('apiBase') || '';
}
function log(msg){
  const pre = $('#apiLog');
  pre.textContent = (pre.textContent ? pre.textContent + '\n' : '') + msg;
}
async function testHealth(){
  const base = ($('#apiBase').value || '').replace(/\/+$/,'');
  if(!base){ log('No API base set.'); return; }
  try{
    const r = await fetch(base + '/health', { headers: { 'Accept':'application/json' } });
    const t = await r.text();
    log('Response: ' + t);
  }catch(err){
    log('Error: ' + err.message);
  }
}

$('#saveSettings').onclick = saveSettings;
$('#testHealth').onclick = testHealth;

// Init
loadRituals();
loadSettings();
listEntries();
