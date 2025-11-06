(() => {
  const DATA_URL = 'releases.json';   // or '/releases.json'
  const GRID_ID  = 'release-grid';       // index.html has this container
  
// make asset paths absolute (works from /, /releases, /artists/*)
const resolveAsset = (p = '') => {
  if (!p) return '';
  if (/^https?:\/\//i.test(p)) return p;
  return '/' + String(p).replace(/^\/+/, '');
};

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
// Map JSON artist → exact file name in /artists (match your tree's casing)
const ARTIST_PAGES = {
  sai: 'sai',
  shinrei: 'shinrei',
  smooch: 'smooch',
  sunni: 'sunni',
  v0calyst: 'V0CALYST',
  seraphim: 'seraphim',
  krewlty: 'krewlty',
  suleymon: 'suleymon' // <-- ADDED THIS LINE
};

// Display name (adds period for smooch. and umlaut for süleymon)
const displayArtist = (name = '') => {
  const n = String(name).trim();
  const nLower = n.toLowerCase();

  return nLower === 'smooch' ? 'smooch.' :
         nLower === 'suleymon' ? 'süleymon' :
         n; // Return original name
};

// Build link HTML if we have a page for this artist
const artistHTML = (name = '') => {
  const key = String(name).trim().toLowerCase();
  const file = ARTIST_PAGES[key];
  const label = escapeHtml(displayArtist(name));
  return file ? `<a class="artist-link" href="/artists/${file}">${label}</a>` : label;
};


  const createCard = (r) => {
    const card = document.createElement('div');
    card.className = 'release';

    card.innerHTML = `
    ${releaseIconHTML(r['Catalog#'])}
    <img src="${resolveAsset(r['Cover JPG'])}" alt="${escapeHtml(r.Title)} cover" />
      <div class="info">
        <div class="title">${escapeHtml(r.Title)}</div>
        <div class="artist">${artistHTML(r.Artist)}</div>
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
      const latest = all.slice(0, 4);
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
