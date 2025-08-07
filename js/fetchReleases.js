document.addEventListener('DOMContentLoaded', async () => {
    // More reliable page detection
    const isReleasesPage = document.querySelector('.full-releases') !== null;
    const limit = isReleasesPage ? Infinity : 3;
    const grid = isReleasesPage ? 
        document.querySelector('.full-releases') : 
        document.querySelector('.release-grid');

    // Better loading state
    grid.innerHTML = `
        <div class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading releases...</p>
        </div>
    `;

    try {
        // Load CSV data
        const response = await fetch('releases.csv');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const csvData = await response.text();
        
        // Parse CSV
        const { data, errors } = Papa.parse(csvData, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true
        });

        if (errors.length > 0) {
            console.warn('CSV parsing warnings:', errors);
        }

        // Process and sort releases (newest first)
        const sortedReleases = data
            .filter(release => release['Catalog#'] && release['Cover JPG'])
            .sort((a, b) => new Date(b['Release Date']) - new Date(a['Release Date']));

        if (sortedReleases.length === 0) {
            throw new Error('No valid releases found in CSV');
        }

        // Render releases
        renderReleases(sortedReleases.slice(0, limit), grid);

    } catch (error) {
        console.error('Error loading releases:', error);
        grid.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load releases. ${error.message}</p>
            </div>
        `;
    }
});

function renderReleases(releases, grid) {
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

    // Reattach hover effects after rendering
    setupReleaseHoverEffects();
}

function formatDate(dateString) {
    if (!dateString) return '';
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

function setupReleaseHoverEffects() {
    document.querySelectorAll('.release').forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateY(-5px)';
            item.style.animation = 'flicker 0.8s';
        });
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'none';
            item.style.animation = 'none';
        });
    });
}