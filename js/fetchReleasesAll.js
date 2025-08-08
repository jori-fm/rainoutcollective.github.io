document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('release-grid');
  if (!grid) return;

  // put near the top
function asLocalDate(isoYmd) {
  const [y, m, d] = String(isoYmd).split('-').map(Number);
  return new Date(y, m - 1, d); // local midnight
}


  // optional: show a temporary loading state
  grid.classList.add('loading');

  fetch('releases.json')
    .then(r => r.json())
    .then(data => {
      grid.classList.remove('loading');

      // newest → oldest
      const sorted = [...data].sort((a, b) => asLocalDate(b['Release Date']) - asLocalDate(a['Release Date']));

      sorted.forEach(release => {
        const card = document.createElement('div');
        card.className = 'release';

        const isSingle = String(release['Catalog#']).toUpperCase().includes('S');
        const icon = isSingle ? 'fa-music' : 'fa-record-vinyl';
        const displayArtist = release['Artist'] === 'smooch' ? 'smooch.' : release['Artist'];
        const imgSrc = release['Cover JPG'];

        const d = asLocalDate(release['Release Date']);
        const niceDate = isNaN(d) ? release['Release Date']
                                  : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });

        card.innerHTML = `
          <div class="format-icon"><i class="fas ${icon}"></i></div>
          <img src="${imgSrc}" alt="${release['Title']} cover">
          <div class="info">
            <div class="title">${release['Title']}</div>
            <div class="artist">
  <a href="artists/${release['Artist']}.html">
    ${displayArtist}
  </a>
</div>

            <div class="catalog">${release['Catalog#']} • ${niceDate}</div>
            <div class="streaming-links">
              ${release['Spotify'] ? `<a href="${release['Spotify']}" target="_blank" rel="noopener"><i class="fab fa-spotify"></i></a>` : ''}
              ${release['Apple Music'] ? `<a href="${release['Apple Music']}" target="_blank" rel="noopener"><i class="fab fa-apple"></i></a>` : ''}
              ${release['Youtube'] ? `<a href="${release['Youtube']}" target="_blank" rel="noopener"><i class="fab fa-youtube"></i></a>` : ''}
            </div>
          </div>
        `;
        grid.appendChild(card);
      });
    })
    .catch(err => {
      grid.classList.remove('loading');
      console.error('Failed to load releases.json', err);
    });
});
