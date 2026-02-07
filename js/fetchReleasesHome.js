/* Fetches latest releases for the Home Page (index.html) */
(() => {
  const DATA_URL = 'releases.json';
  const GRID_ID  = 'release-grid';
  
  const resolveAsset = (p = '') => {
    if (!p) return '';
    if (/^https?:\/\//i.test(p)) return p;
    return '/' + String(p).replace(/^\/+/, '');
  };

  const escapeHtml = (s='') =>
    s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  const toDate = (iso) => { const d = new Date(iso + 'T00:00:00'); d.setHours(0,0,0,0); return d; };
  const isFuture = (iso) => { const t = new Date(); t.setHours(0,0,0,0); return toDate(iso) > t; };
  const isSingle = (r) => (r.Format || '').toLowerCase() === 'single';

  // 2. Icon Logic: Now checks the format instead of looking for an "S"
  const releaseIconHTML = (r) =>
    isSingle(r)
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
        'claire-eterna': 'claire-eterna',
        "Claire Eterna": 'claire-eterna',
        avalon: 'avalon'
      };
        
        const displayArtist = (name = '') => {
          const n = String(name).trim();
          const nLower = n.toLowerCase();
          return nLower === 'smooch' ? 'smooch.' :
                 nLower === 'suleymon' ? 'süleymon' :
                 nLower === 'claire-eterna' ? 'Claire Eterna' :
                 n;
        };
      

        const artistHTML = (name = '') => {
          // 1. Split the raw string by comma (e.g. "sunni, V0CALYST")
          const names = String(name).split(',');
      
          // 2. Map over each name to create a link or plain text
          const links = names.map(rawName => {
              const n = rawName.trim();
              const key = n.toLowerCase();
              const file = ARTIST_PAGES[key];
              const label = escapeHtml(displayArtist(n));
              
              // Return link if valid, otherwise plain text
              return file ? `<a class="artist-link" href="/artists/${file}">${label}</a>` : label;
          });
      
          // 3. Join them back together with " & "
          return links.join(' & ');
        };
  const createCard = (r) => {
    // 3. META TEXT LOGIC:
    // If it has a Catalog # AND isn't a single, show "RAIN-XXX • Date"
    // If it is a single (or has no Catalog #), just show "Date"
    const metaText = (r['Catalog#'] && !isSingle(r)) 
      ? `${escapeHtml(r['Catalog#'])} • ${escapeHtml(r['Release Date'])}` 
      : escapeHtml(r['Release Date']);

    const el = document.createElement('div');
    el.className = 'release';
    el.innerHTML = `
    ${releaseIconHTML(r)}
      <img src="${resolveAsset(r['Cover JPG'])}" alt="${escapeHtml(r.Title)} cover" />
      <div class="info">
        <div class="title">${escapeHtml(r.Title)}</div>
        <div class="artist">${artistHTML(r.Artist)}</div>
        
        <div class="catalog">${metaText}</div>
        
        ${r.detailsPage ? `<a href="${r.detailsPage}" class="learn-more-link">Learn More →</a>` : ''}
      </div>
    `;

    // Streaming Links Logic (Unchanged)
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

  const fetchAndRender = async () => {
    const grid = document.getElementById(GRID_ID);
    if (!grid) return;
    grid.classList.add('loading');

    try {
      const res = await fetch(DATA_URL, { cache: 'no-store' });
      const data = await res.json();
      
      // Sort newest -> oldest
      data.sort((a, b) => toDate(b['Release Date']) - toDate(a['Release Date']));
      
      // Take top 4 for homepage
      const latest = data.slice(0, 4);
      
      grid.classList.remove('loading');
      
      if (latest.length === 0) {
        grid.innerHTML = `<div class="error-state">No releases found.</div>`;
        return;
      }

      latest.forEach(r => grid.appendChild(createCard(r)));
      
    } catch (e) {
      grid.classList.remove('loading');
      grid.innerHTML = `<div class="error-state">Couldn’t load releases.</div>`;
      console.error(e);
    }
  };

  document.addEventListener('DOMContentLoaded', fetchAndRender);
})();