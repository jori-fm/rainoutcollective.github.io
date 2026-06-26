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
  const isSingle = (r) => (r.Format || '').toLowerCase() === 'single';

  // 2. Icon Logic: Now checks the format instead of looking for an "S"
  const releaseIconHTML = (r) =>
    isSingle(r)
      ? `<div class="format-icon" aria-label="Single"><i class="fa-solid fa-music"></i></div>`
      : `<div class="format-icon" aria-label="Album or EP"><i class="fa-solid fa-record-vinyl"></i></div>`;
  
      const ARTIST_PAGES = {
        lunamaryllis: 'lunamaryllis',
        shinrei: 'shinrei',
        angelfriend: 'angelfriend',
        'angelfriend.': 'angelfriend',
        pezzz: 'PEZZZ',
        'pezzz!': 'PEZZZ',
        suuni: 'suuni',
        jayys: 'jayys',
        v0calyst: 'V0CALYST',
        seraphim: 'seraphim',
        krewlty: 'krewlty',
        hellayercs: 'hellayercs',
        'hellayercs': 'hellayercs',
        'claire-eterna': 'claire-eterna',
        "Claire Eterna": 'claire-eterna',
        avalon: 'avalon',
        'sollaceee!': 'sollaceee',
        'cindy-yearns': 'cindy-yearns',
        "cindy yearns": 'cindy-yearns',
        "castle belmont": 'castle-belmont',
        blueZoe: 'blueZoe',
        "bluezoe": 'blueZoe',
        "ramona heart": "ramona-heart"
      };
        
        const displayArtist = (name = '') => {
          const n = String(name).trim();
          const nLower = n.toLowerCase();
          return nLower === 'angelfriend' ? 'angelfriend' :
                 nLower === 'hellayercs' ? 'hellayercs' :
                 nLower === 'claire-eterna' ? 'Claire Eterna' :
                 n;
        };
      

  const artistHTML = (name = '') => {
    const key = String(name).trim().toLowerCase();
    const file = ARTIST_PAGES[key];
    const label = escapeHtml(displayArtist(name));
    return file ? `<a class="artist-link" href="/artists/${file}">${label}</a>` : label;
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
      // 1. Default text
      let htmlContent = `<span class="coming-soon">COMING SOON</span>`;
      
      // 2. Check for Pre-save link in the JSON
      if (r.presave) {
        htmlContent += `
          <div style="width: 100%; display: flex; justify-content: center;">
              <a class="presave-btn" href="${r.presave}" target="_blank">
                  <i class="fas fa-link"></i> PRE-SAVE
              </a>
          </div>
        `;
    }
      
      links.innerHTML = htmlContent;
    } else {
      let releasedLinksHTML = '';
      
      // Only add the Spotify button if a link exists
      if (r.Spotify) {
        releasedLinksHTML += `<a class="streaming-link spotify" href="${r.Spotify}" target="_blank" rel="noopener" aria-label="Spotify"><i class="fab fa-spotify"></i></a>\n`;
      }
      
      // Only add the Apple Music button if a link exists
      if (r['Apple Music']) {
        releasedLinksHTML += `<a class="streaming-link apple" href="${r['Apple Music']}" target="_blank" rel="noopener" aria-label="Apple Music"><i class="fab fa-apple"></i></a>\n`;
      }
      
      // Only add the YouTube button if a link exists
      if (r.Youtube) {
        releasedLinksHTML += `<a class="streaming-link youtube" href="${r.Youtube}" target="_blank" rel="noopener" aria-label="YouTube"><i class="fab fa-youtube"></i></a>\n`;
      }
      
      links.innerHTML = releasedLinksHTML;
    }
    el.appendChild(links);
    return el;
  };

  const render = async () => {
    const wrap = document.getElementById(WRAP_ID);
    if (!wrap) return;

    const artistKey = (wrap.dataset.artist || '').trim().toLowerCase();
    if (!artistKey) return;

    try {
      const res = await fetch(DATA_URL, { cache: 'no-store' });
      const all = await res.json();

      // UPDATED FILTER: Check if the artist field INCLUDES the current page's artist key
      // This allows "suuni, V0CALYST" to show up on both pages.
      const mine = all.filter(r => {
        // NEW: Hide singles that drop in the future completely
        if (isSingle(r) && isFuture(r['Release Date'])) return false;

        const artists = (r.Artist || '').toLowerCase();
        // Split by comma to safely check individual names
        const artistList = artists.split(',').map(a => a.trim()); 
        return artistList.includes(artistKey);
    });

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