document.addEventListener('DOMContentLoaded', () => {
  const scroller = document.getElementById('artist-releases');
  if (!scroller) return;

  // put near the top
function asLocalDate(isoYmd) {
  const [y, m, d] = String(isoYmd).split('-').map(Number);
  return new Date(y, m - 1, d); // local midnight
}


  const artist = scroller.dataset.artist; // e.g., "smooch"
  if (!artist) return;

  fetch('../releases.json')
    .then(r => r.json())
    .then(data => {
      // filter by artist, keep newest first
      const list = data
        .filter(r => String(r['Artist']).toLowerCase() === artist.toLowerCase())
        .sort((a, b) => asLocalDate(b['Release Date']) - asLocalDate(a['Release Date']));

      list.forEach(release => {
        const card = document.createElement('div');
        card.className = 'release';

        const isSingle = String(release['Catalog#']).toUpperCase().includes('S');
        const icon = isSingle ? 'fa-music' : 'fa-record-vinyl';
        const displayArtist = release['Artist'] === 'smooch' ? 'smooch.' : release['Artist'];
        // Build cover path from the catalog#, e.g. "RAIN-008" or "RAIN-003S" -> "/assets/album-art/rain-008.jpg"
const cat = String(release['Catalog#'] || '');
const m = cat.match(/RAIN-(\d{3})/i);
const imgSrc = m
  ? `/assets/album-art/rain-${m[1]}.jpg`
  // fallback to the JSON field if you ever need it (keeps working site-wide)
  : (release['Cover JPG'] ? (release['Cover JPG'].startsWith('/') ? release['Cover JPG'] : '/' + release['Cover JPG']) : '');


  const d = asLocalDate(release['Release Date']);
        const niceDate = isNaN(d) ? release['Release Date']
                                  : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });

        card.innerHTML = `
          <div class="format-icon"><i class="fas ${icon}"></i></div>
          <img src="${imgSrc}" alt="${release['Title']} cover">
          <div class="info">
            <div class="title">${release['Title']}</div>
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
