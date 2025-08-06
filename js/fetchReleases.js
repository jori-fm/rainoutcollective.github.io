document.addEventListener('DOMContentLoaded', async () => {
        // Add the CSS styles dynamically
        const style = document.createElement('style');
        style.textContent = `
            .format-icon {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%); /* Center initially */
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: all 0.3s ease;
}
            
            .format-icon i {
                color: var(--accent);
                font-size: 12px;
            }
            
            .release:hover .format-icon {
  transform: translateX(-50%) scale(1.1); /* Keep translateX */
  background: rgba(100,150,255,0.3);
}
            
            .release {
    position: relative;
    padding: 25px 20px 20px; /* Increased top padding */
    overflow: visible; /* Ensures icon isn't clipped */
  }
        `;
        document.head.appendChild(style);
    try {
      // Load CSV data
      const response = await fetch('releases.csv');
      if (!response.ok) throw new Error('Failed to load releases');
      const csvData = await response.text();
      
      // Parse CSV
      const { data } = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true
      });
  
      // Process and sort releases (newest first)
      const sortedReleases = data
  .filter(release => release['Catalog#'])
  .sort((a, b) => {
    // Simple YYYY-MM-DD string comparison (no Date objects)
    return b['Release Date'].localeCompare(a['Release Date']);
  });

  
  
      // Render top 3 releases
      renderReleases(sortedReleases.slice(0, 3));
      
    } catch (error) {
      console.error('Error loading releases:', error);
      document.querySelector('.release-grid').innerHTML = `
        <div class="error">
          <i class="fas fa-cloud-rain"></i>
          <p>Releases currently unavailable</p>
        </div>
      `;
    }
  });
  
  function renderReleases(releases) {
    const grid = document.querySelector('.release-grid');
    grid.innerHTML = releases.map(release => `
      <div class="release ${release['Catalog#'].includes('S') ? 'single' : 'album'}">
        <div class="format-icon">
          <i class="fas ${release['Catalog#'].includes('S') ? 'fa-music' : 'fa-compact-disc'}"></i>
        </div>
        <img src="${release['Cover JPG']}" 
             alt="${release.Title}" 
             loading="lazy"
             onerror="this.src='assets/album-art/placeholder.jpg'">
        <div class="info">
          <div class="title">${release.Title}</div>
          <div class="artist">${release.Artist}</div>
          <div class="catalog">${release['Catalog#']}</div>
          <div class="date">${formatDate(release['Release Date'])}</div>
        </div>
        <div class="streaming-links">
          ${createStreamingLink(release.Spotify, 'spotify', 'fa-spotify')}
          ${createStreamingLink(release['Apple Music'], 'apple', 'fa-apple')}
          ${createStreamingLink(release.Youtube, 'youtube', 'fa-youtube')}
        </div>
      </div>
    `).join('');
  }
  
  function formatDate(dateString) {
    // Split the ISO date (YYYY-MM-DD) and format directly
    const [year, month, day] = dateString.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
  }
  
  function createStreamingLink(url, platform, icon) {
    return url ? `
      <a href="${url}" class="streaming-link ${platform}" target="_blank" rel="noopener">
        <i class="fab ${icon}"></i>
      </a>
    ` : '';
  }

  console.log(sortedReleases.map(r => `${r['Catalog#']}: ${r['Release Date']} -> ${formatDate(r['Release Date'])}`));