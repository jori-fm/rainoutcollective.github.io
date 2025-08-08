document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('release-grid');
  if (!container) return;

  // put near the top
function asLocalDate(isoYmd) {
  const [y, m, d] = String(isoYmd).split('-').map(Number);
  return new Date(y, m - 1, d); // local midnight
}


  fetch('releases.json')
    .then(r => r.json())
    .then(data => {
      // sort newest → oldest by Release Date
      const sorted = [...data].sort((a, b) => asLocalDate(b['Release Date']) - asLocalDate(a['Release Date']));

      // show 4 most recent on the home page
      const latest = sorted.slice(0, 4);

      latest.forEach(release => {
        const card = document.createElement('div');
        card.className = 'release';

        const isSingle = String(release['Catalog#']).toUpperCase().includes('S');
        const icon = isSingle ? 'fa-music' : 'fa-record-vinyl';

        const displayArtist = release['Artist'] === 'smooch' ? 'smooch.' : release['Artist'];

        // Use given image path
        const imgSrc = release['Cover JPG'];

        // Pretty date, fallback to raw string if parsing fails
        const d = asLocalDate(release['Release Date']);
        const niceDate = isNaN(d) ? release['Release Date']
                                  : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });

        card.innerHTML = `
          <div class="format-icon"><i class="fas ${icon}"></i></div>
          <img src="${imgSrc}" alt="${release['Title']} cover">
          <div class="info">
            <div class="title">${release['Title']}</div>
            <div class="artist">${displayArtist}</div>
            <div class="catalog">${release['Catalog#']} • ${niceDate}</div>
            <div class="streaming-links">
              ${release['Spotify'] ? `<a href="${release['Spotify']}" target="_blank" rel="noopener"><i class="fab fa-spotify"></i></a>` : ''}
              ${release['Apple Music'] ? `<a href="${release['Apple Music']}" target="_blank" rel="noopener"><i class="fab fa-apple"></i></a>` : ''}
              ${release['Youtube'] ? `<a href="${release['Youtube']}" target="_blank" rel="noopener"><i class="fab fa-youtube"></i></a>` : ''}
            </div>
          </div>
        `;
        container.appendChild(card);
      });
    })
    .catch(err => console.error('Failed to load releases.json', err));
});
