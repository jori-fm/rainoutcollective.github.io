(() => {
  const DATA_URL = '../releases.json';
  const GRID_ID  = 'release-grid';

  const escapeHtml = (s='') =>
    s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  const toDate = (iso) => { const d = new Date(iso + 'T00:00:00'); d.setHours(0,0,0,0); return d; };
  const isFuture = (iso) => { const t = new Date(); t.setHours(0,0,0,0); return toDate(iso) > t; };
  const isSingle = (catalog = '') => /S/i.test(String(catalog));
const releaseIconHTML = (catalog = '') =>
  isSingle(catalog)
    ? `<div class="format-icon" aria-label="Single"><i class="fa-solid fa-music"></i></div>`
    : `<div class="format-icon" aria-label="Album or EP"><i class="fa-solid fa-record-vinyl"></i></div>`;


  const createCard = (r) => {
    const el = document.createElement('div');
    el.className = 'release';
    el.innerHTML = `
      <div class="format-icon" title="${escapeHtml(r.Format || '')}">
        ${releaseIconHTML(r['Catalog#'])}
      </div>
      <img src="${r['Cover JPG']}" alt="${escapeHtml(r.Title)} cover" />
      <div class="info">
        <div class="title">${escapeHtml(r.Title)}</div>
        <div class="artist">${escapeHtml(r.Artist)}</div>
        <div class="catalog">${escapeHtml(r['Catalog#'])} • ${escapeHtml(r['Release Date'])}</div>
      </div>
    `;

    const links = document.createElement('div');
    links.className = 'streaming-links';
    if (isFuture(r['Release Date'])) {
      links.innerHTML = `<span class="coming-soon">COMING SOON</span>`;
    } else {
      links.innerHTML = `
        <a class="streaming-link spotify" href="${r.Spotify}" target="_blank" rel="noopener" aria-label="Spotify"><i class="fab fa-spotify"></i></a>
        <a class="streaming-link apple"   href="${r['Apple Music']}" target="_blank" rel="noopener" aria-label="Apple Music"><i class="fab fa-apple"></i></a>
        <a class="streaming-link youtube" href="${r.Youtube}" target="_blank" rel="noopener" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
      `;
    }
    el.appendChild(links);
    return el;
  };

  const render = async () => {
    const grid = document.getElementById(GRID_ID);
    if (!grid) return;
    grid.classList.add('loading');

    try {
      const res = await fetch(DATA_URL, { cache: 'no-store' });
      const data = await res.json();
      data.sort((a, b) => toDate(b['Release Date']) - toDate(a['Release Date']));
      grid.classList.remove('loading');
      data.forEach(r => grid.appendChild(createCard(r)));
    } catch (e) {
      grid.classList.remove('loading');
      grid.innerHTML = `<div class="error-state">Couldn’t load releases.</div>`;
      console.error(e);
    }
  };

  document.addEventListener('DOMContentLoaded', render);
})();
