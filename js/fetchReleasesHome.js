(() => {
  const DATA_URL = '../releases.json';     // absolute so it works from any page
  const GRID_ID  = 'release-grid';       // index.html has this container

  const escapeHtml = (s='') =>
    s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  const toDate = (iso) => {
    // Treat dates as local “calendar dates” to avoid timezone off-by-ones
    const d = new Date(iso + 'T00:00:00');
    d.setHours(0,0,0,0);
    return d;
  };
  const isFuture = (iso) => {
    const today = new Date(); today.setHours(0,0,0,0);
    return toDate(iso) > today;
  };

  const isSingle = (catalog = '') => /S/i.test(String(catalog));
const releaseIconHTML = (catalog = '') =>
  isSingle(catalog)
    ? `<div class="format-icon" aria-label="Single"><i class="fa-solid fa-music"></i></div>`
    : `<div class="format-icon" aria-label="Album or EP"><i class="fa-solid fa-record-vinyl"></i></div>`;


  const createCard = (r) => {
    const card = document.createElement('div');
    card.className = 'release';

    card.innerHTML = `
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

    card.appendChild(links);
    return card;
  };

  const render = async () => {
    const grid = document.getElementById(GRID_ID);
    if (!grid) return;
    grid.classList.add('loading');

    try {
      const res = await fetch(DATA_URL, { cache: 'no-store' });
      const all = await res.json();

      // sort newest → oldest
      all.sort((a, b) => toDate(b['Release Date']) - toDate(a['Release Date']));

      // show latest 8 on the home page
      const latest = all.slice(0, 8);
      grid.classList.remove('loading');
      latest.forEach(r => grid.appendChild(createCard(r)));
    } catch (e) {
      grid.classList.remove('loading');
      grid.innerHTML = `<div class="error-state">Couldn’t load releases.</div>`;
      console.error(e);
    }
  };

  document.addEventListener('DOMContentLoaded', render);
})();
