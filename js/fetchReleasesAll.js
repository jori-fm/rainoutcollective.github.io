document.addEventListener('DOMContentLoaded', function () {
    Papa.parse('releases.csv', {
      download: true,
      header: true,
      complete: function (results) {
        const releases = results.data;
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
      <div class="format-icon">${release["format"] || ""}</div>
      <img src="assets/album-art/${release["cover jpg"]}" alt="${release["title"]}">
      <div class="info">
        <div class="title">${release["title"]}</div>
        <div class="artist">${release["artist"]}</div>
        <div class="catalog">${release["catalog#"]}</div>
        <div class="streaming-links">
          ${release["spotify"] ? `<a href="${release["spotify"]}" target="_blank" class="streaming-link spotify"><i class="fab fa-spotify"></i></a>` : ''}
          ${release["apple music"] ? `<a href="${release["apple music"]}" target="_blank" class="streaming-link apple"><i class="fab fa-apple"></i></a>` : ''}
          ${release["youtube"] ? `<a href="${release["youtube"]}" target="_blank" class="streaming-link youtube"><i class="fab fa-youtube"></i></a>` : ''}
        </div>
      </div>
    `;
  
    return card;
  }
  