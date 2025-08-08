
document.addEventListener('DOMContentLoaded', function () {
    Papa.parse('releases.csv', {
      download: true,
      header: true,
      complete: function (results) {
        const releases = results.data.slice(0, 3);
        const container = document.querySelector('.release-grid');
        if (!container) return;
  
        releases.forEach(release => {
          container.appendChild(createReleaseCard(release));
        });
      }
    });
  });
  
  function createReleaseCard(release) {
    const card = document.createElement('div');
    card.className = 'release';
  
    card.innerHTML = `
      <div class="format-icon">${release["Format"] || ""}</div>
      <img src="assets/album-art/${release["Cover JPG"]}" alt="${release["Title"]}">
      <div class="info">
        <div class="title">${release["Title"]}</div>
        <div class="artist">${release["Artist"]}</div>
        <div class="catalog">${release["Catalog#"]}</div>
        <div class="streaming-links">
          ${release["Spotify"] ? `<a href="${release["Spotify"]}" target="_blank" class="streaming-link spotify"><i class="fab fa-spotify"></i></a>` : ''}
          ${release["Apple Music"] ? `<a href="${release["Apple Music"]}" target="_blank" class="streaming-link apple"><i class="fab fa-apple"></i></a>` : ''}
          ${release["Youtube"] ? `<a href="${release["Youtube"]}" target="_blank" class="streaming-link youtube"><i class="fab fa-youtube"></i></a>` : ''}
        </div>
      </div>
    `;
  
    return card;
  }
  