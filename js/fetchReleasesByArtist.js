document.addEventListener('DOMContentLoaded', () => {
  const scroller = document.getElementById('artist-releases');
  if (!scroller) return;

  const artist = scroller.dataset.artist; // e.g., "smooch"
  if (!artist) return;

  fetch('../releases.json')
    .then(r => r.json())
    .then(data => {
      // filter by artist, keep newest first
      const list = data
        .filter(r => String(r['Artist']).toLowerCase() === artist.toLowerCase())
        .sort((a, b) => new Date(b['Release Date']) - new Date(a['Release Date']));

      list.forEach(release => {
        const card = document.createElement('div');
        card.className = 'release';

        const isSingle = String(release['Catalog#']).toUpperCase().includes('S');
        const icon = isSingle ? 'fa-music' : 'fa-record-vinyl';
        const displayArtist = release['Artist'] === 'smooch' ? 'smooch.' : release['Artist'];
        const imgSrc = release['Cover JPG'];

        const d = new Date(release['Release Date']);
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
        scroller.appendChild(card);
      });
    })
    .catch(err => console.error('Failed to load releases.json', err));
});
