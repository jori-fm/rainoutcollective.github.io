/* Fetches releases for specific Artist Profile pages */
(() => {
  const DATA_URL = '../releases.json';
  const WRAP_ID  = 'artist-releases';
  
  const resolveAsset = (p = '') => {
    if (!p) return '';
    if (/^https?:\/\//i.test(p)) return p;
    return '/' + String(p).replace(/^\/+/, '');
  };

  const escapeHtml = (s='') =>
    s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  const toDate = (iso) => { const d = new Date(iso + 'T00:00:00'); d.setHours(0,0,0,0); return d; };
  const isFuture = (iso) => { const t = new Date(); t.setHours(0,0,0,0); return toDate(iso) > t; };
  const isSingle = (catalog = '') => /S/i.test(String(catalog));
  
  const releaseIconHTML = (catalog = '') =>
    isSingle(catalog)
      ? `<div class="format-icon" aria-label="Single"><i class="fa-solid fa-music"></i></div>`
      : `<div class="format-icon" aria-label="Album or EP"><i class="fa-solid fa-record-vinyl"></i></div>`;
  
      const ARTIST_PAGES = {
        lunamaryllis: 'lunamaryllis',
        shinrei: 'shinrei',
        smooch: 'smooch',
        'smooch.': 'smooch',
        sunni: 'sunni',
        v0calyst: 'V0CALYST',
        seraphim: 'seraphim',
        krewlty: 'krewlty',
        suleymon: 'suleymon',
        'süleymon': 'suleymon',
        timeflower: 'timeflower'
      };

  const displayArtist = (name = '') => {
    const n = String(name).trim();
    const nLower = n.toLowerCase();
    return nLower === 'smooch' ? 'smooch.' :
           nLower === 'suleymon' ? 'süleymon' :
           n;
  };

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
        <div class="catalog">${escapeHtml(r['Catalog#'])} • ${escapeHtml(r['Release Date'])}</div>
        
        ${r.detailsPage ? `<a href="${r.detailsPage}" class="learn-more-link">Learn More →</a>` : ''}
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
    const wrap = document.getElementById(WRAP_ID);
    if (!wrap) return;

    const artistKey = (wrap.dataset.artist || '').trim().toLowerCase();
    if (!artistKey) return;

    try {
      const res = await fetch(DATA_URL, { cache: 'no-store' });
      const all = await res.json();

      // filter by artist (case-insensitive match)
      const mine = all.filter(r => String(r.Artist || '').toLowerCase() === artistKey);

      // newest → oldest
      mine.sort((a, b) => toDate(b['Release Date']) - toDate(a['Release Date']));

      // Update Release Count Text
      const countTextElement = document.getElementById('release-count-text');
      if (countTextElement) {
        const count = mine.length;
        if (count === 0) {
          countTextElement.textContent = "No releases under RAINOUT yet";
        } else {
          const releaseText = count === 1 ? 'release' : 'releases';
          countTextElement.textContent = `${count} ${releaseText} under RAINOUT`;
        }
      }

      if (mine.length === 0) {
        wrap.innerHTML = `<div class="error-state">No releases yet.</div>`;
        return;
      }

      mine.forEach(r => wrap.appendChild(createCard(r)));
    } catch (e) {
      wrap.innerHTML = `<div class="error-state">Couldn’t load this artist’s releases.</div>`;
      console.error(e);
    }
  };

  document.addEventListener('DOMContentLoaded', render);
})();