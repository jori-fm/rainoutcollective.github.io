
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('artist-releases');
  if (!container) return;
  const targetArtist = container.dataset.artist.toLowerCase();
  if (!container) return;

  fetch('../releases.json')
    .then(response => response.json())
    .then(data => {
      const latestReleases = data.filter(release => release["Artist"].toLowerCase() === targetArtist);

      latestReleases.forEach(release => {
        const card = document.createElement('div');
        card.className = 'release';

        const imageName = release["Catalog#"].toLowerCase().replace(/s/gi, '');
        const icon = release["Catalog#"].toUpperCase().includes("S") ? "fa-music" : "fa-record-vinyl";
        const displayArtist = release["Artist"] === "smooch" ? "smooch." : release["Artist"];

        card.innerHTML = `
          <div class="format-icon"><i class="fas ${icon}"></i></div>
          <img src="../assets/album-art/${imageName}.jpg" alt="${release["Title"]}">
          <div class="info">
            <div class="title">${release["Title"]}</div>
            <div class="catalog">${release["Catalog#"]}</div>
            <div class="streaming-links">
              ${release["Spotify"] ? `<a href="${release["Spotify"]}" target="_blank"><i class="fab fa-spotify"></i></a>` : ''}
              ${release["Apple Music"] ? `<a href="${release["Apple Music"]}" target="_blank"><i class="fab fa-apple"></i></a>` : ''}
              ${release["Youtube"] ? `<a href="${release["Youtube"]}" target="_blank"><i class="fab fa-youtube"></i></a>` : ''}
            </div>
          </div>
        `;

        container.appendChild(card);
      });
    });
});
