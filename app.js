// Simple PWA for rituals + journaling with localStorage

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// ---- Export entries to JSON ----
$("#exportEntries")?.onclick = () => {
  const keys = Object.keys(localStorage).filter(k => k.startsWith("entry:"));
  const arr = keys.map(k => JSON.parse(localStorage.getItem(k))).filter(Boolean);
  const blob = new Blob([JSON.stringify(arr, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "compass-house-journal.json";
  a.click();
  URL.revokeObjectURL(url);
};

// --- Journal Save ---
$("#saveEntry")?.addEventListener("click", async () => {
  const title = $("#journalTitle").value.trim();
  const text = $("#journalBody").value.trim();
  if (!title && !text) {
    alert("Write something first 🙂");
    return;
  }

  // save locally
  const id = Date.now();
  const entry = { id, title, text, ts: new Date().toISOString() };
  localStorage.setItem(`entry:${id}`, JSON.stringify(entry));

  // clear inputs
  $("#journalTitle").value = "";
  $("#journalBody").value = "";

  // reload entries
  loadEntries();
});

// --- Load Entries ---
function loadEntries() {
  const keys = Object.keys(localStorage).filter(k => k.startsWith("entry:"));
  const arr = keys
    .map(k => JSON.parse(localStorage.getItem(k)))
    .filter(Boolean)
    .sort((a, b) => b.id - a.id); // newest first

  $("#entriesLog").textContent = arr.map(
    e => `${e.ts}\n${e.title}\n${e.text}\n---`
  ).join("\n\n");
}

// ---- Settings (optional API) ----
function saveSettings(){
  const base = $("#apiBase").value.trim();
  localStorage.setItem("apiBase", base);
  log(`Saved API base: ${base || "(none)"}`);
}// ---- Load & show entries in the list (and keep newest first)
function loadEntries(){
  const list = document.getElementById('entriesList');
  if (!list) return;

  list.innerHTML = '';
  const keys = Object.keys(localStorage)
    .filter(k => k.startsWith('entry:'))
    .sort()               // ascending
    .reverse();           // newest first

  keys.forEach(k => {
    const e = JSON.parse(localStorage.getItem(k) || 'null');
    if (!e) return;
    const li = document.createElement('li');

    // a nicer line with timestamp + title + text
    const when = new Date(e.ts).toLocaleString();
    li.textContent = `${when} — ${e.title || '(untitled)'} — ${e.text}`;

    // small delete button
    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.style.marginLeft = '.5rem';
    del.onclick = () => {
      localStorage.removeItem(k);
      loadEntries();
    };

    li.appendChild(del);
    list.appendChild(li);
  });
}

// refresh list after saving
document.getElementById('saveEntry')?.addEventListener('click', () => {
  setTimeout(loadEntries, 150);
});

// clear-all button
document.getElementById('clearAll')?.addEventListener('click', () => {
  const keys = Object.keys(localStorage).filter(k => k.startsWith('entry:'));
  if (!keys.length) { alert('No entries to clear.'); return; }
  if (!confirm(`Delete ${keys.length} entries?`)) return;
  keys.forEach(k => localStorage.removeItem(k));
  loadEntries();
});

// load once on page start
window.addEventListener('load', loadEntries);


function loadSettings(){
  $("#apiBase").value = localStorage.getItem("apiBase") || "";
}

function log(msg){
  const pre = $("#apiLog");
  pre.textContent = (pre.textContent ? pre.textContent + "\n" : "") + msg;
}

async function testHealth(){
  const base = ($("#apiBase").value || "").replace(/\/+$/, "");
  if (!base) { log("No API base set."); return; }
  try {
    const r = await fetch(base + "/health", { headers: { "Accept": "application/json" } });
    const t = await r.text();
    log("Response: " + t);
  } catch(err) {
    log("Error: " + err.message);
  }
}

$("#saveSettings")?.onclick = saveSettings;
$("#testHealth")?.onclick = testHealth;

// Init: load entries + settings
loadEntries();
loadSettings();
// --- Show saved entries in the list ---
function loadEntries() {
  const entriesList = document.getElementById("entriesList");
  entriesList.innerHTML = "";

  const keys = Object.keys(localStorage).filter(k => k.startsWith("entry:"));
  keys.forEach(key => {
    const entry = JSON.parse(localStorage.getItem(key));
    if (entry) {
      const li = document.createElement("li");
      li.textContent = `${entry.title}: ${entry.body}`;
      entriesList.appendChild(li);
    }
  });
}

// --- Clear all entries button ---
document.getElementById("clearAll").addEventListener("click", () => {
  Object.keys(localStorage).forEach(k => {
    if (k.startsWith("entry:")) localStorage.removeItem(k);
  });
  loadEntries();
});

// Reload list on startup
document.addEventListener("DOMContentLoaded", loadEntries);
// ===== Journal Save + List =====

// Save one entry to localStorage
function saveEntry() {
  const titleEl = document.getElementById('journalTitle');
  const bodyEl  = document.getElementById('journalBody');

  const title = (titleEl?.value || '').trim();
  const text  = (bodyEl?.value  || '').trim();

  if (!title && !text) {
    alert('Write something first 😀');
    return;
  }

  const id = Date.now();
  const entry = { id, title, text, ts: new Date().toISOString() };

  localStorage.setItem(`entry:${id}`, JSON.stringify(entry));

  // clear inputs
  if (titleEl) titleEl.value = '';
  if (bodyEl)  bodyEl.value  = '';

  loadEntries(); // refresh the list
}

// Build the Saved Entries list
function loadEntries() {
  const list = document.getElementById('entriesList');
  if (!list) return;

  list.innerHTML = '';

  const keys = Object.keys(localStorage)
    .filter(k => k.startsWith('entry:'))
    .sort()
    .reverse(); // newest first

  if (keys.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No entries yet.';
    list.appendChild(li);
    return;
  }

  keys.forEach(k => {
    const e = JSON.parse(localStorage.getItem(k) || 'null');
    if (!e) return;

    const li = document.createElement('li');
    const when = new Date(e.ts).toLocaleString();
    li.textContent = `${when} — ${e.title || '(untitled)'} — ${e.text}`;
    list.appendChild(li);
  });
}

// Wire up button + load on start
document.getElementById('saveEntry')?.addEventListener('click', saveEntry);
window.addEventListener('load', loadEntries);
