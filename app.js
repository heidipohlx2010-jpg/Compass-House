function saveEntry(){
  const title = document.getElementById('journalTitle').value.trim();
  const text  = document.getElementById('journalBody').value.trim();
  if (!title && !text) { alert('Write something first 🙂'); return; }

  const id = Date.now();
  const entry = { id, title, text, ts: new Date().toISOString() };
  localStorage.setItem(`entry:${id}`, JSON.stringify(entry));

  document.getElementById('journalTitle').value = '';
  document.getElementById('journalBody').value  = '';
  loadEntries();
}

function loadEntries(){
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

document.getElementById('saveEntry')?.addEventListener('click', saveEntry);
window.addEventListener('load', loadEntries);
document.getElementById('clearAll')?.addEventListener('click', () => {
  Object.keys(localStorage).forEach(k => { if (k.startsWith('entry:')) localStorage.removeItem(k); });
  loadEntries();
});
