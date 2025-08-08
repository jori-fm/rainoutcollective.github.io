const container = document.getElementById('artist-releases');
if (!container) return;

const normalize = str => str.toLowerCase().replace(/\./g, '').trim();
const targetArtist = container.dataset.artist.toLowerCase();


fetch('../releases.csv')
  .then(response => response.text())
  .then(csv => {
    const rows = csv.split('\n').slice(1);
    const artistReleases = rows
      .map(row => row.split(','))
      .map(columns => ({
        catalog: columns[0]?.trim(),
        artist: columns[1]?.trim(),
        title: columns[2]?.trim(),
        format: columns[3]?.trim(),
        cover: columns[5]?.trim(),
        spotify: columns[6]?.trim(),
        apple: columns[7]?.trim(),
        youtube: columns[8]?.trim(),
      }))
      .filter(release => release.artist.toLowerCase() === targetArtist);

    artistReleases.forEach(release => {
      const card = document.createElement('div');
      card.className = 'release';

      const imageName = release.catalog.toLowerCase().replace(/s/gi, '');

      const icon = release.catalog.toUpperCase().includes('S')
        ? 'fa-music'
        : 'fa-record-vinyl';

      card.innerHTML = `
        <div class="format-icon"><i class="fas ${icon}"></i></div>
        <img src="../assets/album-art/${imageName}.jpg" alt="${release.title}">
        <div class="info">
          <div class="title">${release.title}</div>
          <div class="artist">${release.artist === "smooch" ? "smooch." : release.artist}</div>
          <div class="catalog">${release.catalog}</div>
          <div class="streaming-links">
            ${release.spotify ? `<a href="${release.spotify}" target="_blank"><i class="fab fa-spotify"></i></a>` : ''}
            ${release.apple ? `<a href="${release.apple}" target="_blank"><i class="fab fa-apple"></i></a>` : ''}
            ${release.youtube ? `<a href="${release.youtube}" target="_blank"><i class="fab fa-youtube"></i></a>` : ''}
          </div>
        </div>
      `;

      container.appendChild(card);
    });
  });
