(() => {
  const DATA_URL = 'releases.json';
  const CONTAINER_SELECTOR = '.releases'; // We target the main container now
  const container = document.querySelector(CONTAINER_SELECTOR);
  
  let allData = []; // To store all fetched releases
  let currentFilter = 'all'; // 'all', 'album', or 'single'

  // --- Helper Functions (Same as before) ---
  
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
    sai: 'sai',
    shinrei: 'shinrei',
    smooch: 'smooch',
    sunni: 'sunni',
    v0calyst: 'V0CALYST',
    seraphim: 'seraphim',
    krewlty: 'krewlty',
    suleymon: 'suleymon',
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
  
  // --- Card Creation (Same as before) ---
  
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

  // --- NEW: Function to render the grid, now grouped by year ---
  
  const renderReleases = () => {
    if (!container) return;
    container.innerHTML = ''; // Clear the main container
    container.classList.add('loading');

    // 1. Filter the stored data
    const filteredData = allData.filter(release => {
      const catalog = release['Catalog#'] || '';
      if (currentFilter === 'all') return true;
      if (currentFilter === 'single') return isSingle(catalog);
      if (currentFilter === 'album') return !isSingle(catalog);
      return true;
    });
    
    container.classList.remove('loading');

    if (filteredData.length === 0) {
      container.innerHTML = `<div class="error-state">No releases found for this filter.</div>`;
      return;
    }

    // 2. Group the filtered data by year
    const releasesByYear = filteredData.reduce((acc, release) => {
      // Get year from "YYYY-MM-DD"
      const year = release['Release Date'].split('-')[0];
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(release);
      return acc;
    }, {}); // Creates an object like { "2025": [...], "2024": [...] }

    // 3. Get the years and sort them descending (e.g., 2025, 2024)
    const sortedYears = Object.keys(releasesByYear).sort((a, b) => b - a);

    // 4. Loop through each year and build the HTML
    for (const year of sortedYears) {
      // Create the <h2> header for the year
      const yearHeader = document.createElement('h2');
      yearHeader.textContent = year;
      // The H2 will automatically pick up your existing styles from style.css
      
      // Create the grid for this year's releases
      const yearGrid = document.createElement('div');
      yearGrid.className = 'release-grid';
      
      // Get the releases for this year
      const releases = releasesByYear[year];
      
      // Create and append each release card to this year's grid
      releases.forEach(r => {
        yearGrid.appendChild(createCard(r));
      });
      
      // Append the new <h2> and <div.release-grid> to the main container
      container.appendChild(yearHeader);
      container.appendChild(yearGrid);
    }
  };

  // --- Function to set up the filter button listeners (Same as before) ---
  
  const setupFilters = () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        currentFilter = button.dataset.filter;
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        renderReleases();
      });
    });
  };

  // --- Main function to fetch data ONCE (Modified to use 'container') ---
  
  const fetchAndRender = async () => {
    if (!container) return; // Check for the new container
    container.classList.add('loading');

    try {
      const res = await fetch(DATA_URL, { cache: 'no-store' });
      const data = await res.json();
      
      data.sort((a, b) => toDate(b['Release Date']) - toDate(a['Release Date']));
      allData = data; 
      
      renderReleases(); // Initial render
      setupFilters();   // Set up filters
      
    } catch (e) {
      container.classList.remove('loading');
      container.innerHTML = `<div class="error-state">Couldn’t load releases.</div>`;
      console.error(e);
    }
  };

  // Run the main function on page load
  document.addEventListener('DOMContentLoaded', fetchAndRender);

})();