
document.addEventListener('DOMContentLoaded', function () {
    Papa.parse('releases.csv', {
      download: true,
      header: true,
      complete: function (results) {
        const releases = results.data.;
        const container = document.querySelector('.release-grid');
        if (!container) return;
  
        releases.forEach(release => {
          container.appendChild(createReleaseCard(release));
        });
      }
    });
  });
  
  
  
  function getFormatIcon(catalog) {
    if (!catalog) return "";
    const isSingle = catalog.toUpperCase().includes("S");
    return isSingle 
      ? '<div class="format-icon"><i class="fas fa-record-vinyl"></i></div>'
      : '<div class="format-icon"><i class="fas fa-record-vinyl"></i></div>';
  }
  
  
  function createReleaseCard(release) {
    const card = document.createElement('div');
    card.className = 'release';
  
    const formatIcon = getFormatIcon(release["Catalog#"]);
  
    card.innerHTML = `
      ${formatIcon}
      <img src="assets/album-art/${release["Catalog#"].toLowerCase() + '.jpg'}" alt="${release["Title"]}">
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
  
  