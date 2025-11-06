(() => {
  const DATA_URL = 'releases.json';   // or '/releases.json'
  const GRID_ID  = 'release-grid';
  
  // make asset paths absolute (works from /, /releases, /artists/*)
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
  const label = escapeHtml(displayArtist(name)); // Uses the new display name
  return file ? `<a class="artist-link" href="/artists/${file}">${label}</a>` : label;
};


  const createCard = (r) => {
    const el = document.createElement('div');
    el.className = 'release';
    el.innerHTML = `
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
    el.appendChild(links);
    return el;
  };

  const renderReleases = () => {
    if (!grid) return;
    grid.innerHTML = ''; // Clear the grid
    grid.classList.add('loading');

    // Filter the stored data
    const filteredData = allData.filter(release => {
      const catalog = release['Catalog#'] || '';
      
      if (currentFilter === 'all') {
        return true; // Show all
      }
      if (currentFilter === 'single') {
        return isSingle(catalog); // Show only singles
      }
      if (currentFilter === 'album') {
        return !isSingle(catalog); // Show only non-singles
      }
      return true;
    });
    
    grid.classList.remove('loading');

    if (filteredData.length === 0) {
      grid.innerHTML = `<div class="error-state">No releases found for this filter.</div>`;
      return;
    }

    // Populate the grid with filtered items
    filteredData.forEach(r => grid.appendChild(createCard(r)));
  };

  // --- NEW: Function to set up the filter button listeners ---
  
  const setupFilters = () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Set the new filter
        currentFilter = button.dataset.filter;
        
        // Update active class on buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Re-render the grid with the new filter
        renderReleases();
      });
    });
  };

  // --- MODIFIED: Main function to fetch data ONCE ---
  
  let allData = []; // To store all fetched releases
  let currentFilter = 'all'; // 'all', 'album', or 'single'
  const grid = document.getElementById(GRID_ID);

  const fetchAndRender = async () => {
    if (!grid) return;
    grid.classList.add('loading');

    try {
      const res = await fetch(DATA_URL, { cache: 'no-store' });
      const data = await res.json();
      
      // Sort the data once and store it
      data.sort((a, b) => toDate(b['Release Date']) - toDate(a['Release Date']));
      allData = data; 
      
      renderReleases(); // Do the initial render (shows 'all')
      setupFilters();   // Set up the click listeners for the buttons
      
    } catch (e) {
      grid.classList.remove('loading');
      grid.innerHTML = `<div class="error-state">Couldn’t load releases.</div>`;
      console.error(e);
    }
  };

  // Run the main function on page load
  document.addEventListener('DOMContentLoaded', fetchAndRender);

})();