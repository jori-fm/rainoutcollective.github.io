// Rain Effect (add this to script.js)
function createRain() {
    if (document.querySelector('.rain')) return; // Avoid duplicates
    
    const rainContainer = document.createElement('div');
    rainContainer.className = 'rain';
    
    // Create rain drops
    for (let i = 0; i < 60; i++) {
      const drop = document.createElement('div');
      drop.className = 'drop';
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.height = `${Math.random() * 20 + 10}px`;
      drop.style.animationDelay = `${Math.random() * 5}s`;
      drop.style.animationDuration = `${Math.random() * 1 + 0.5}s`;
      rainContainer.appendChild(drop);
    }
    
    document.body.appendChild(rainContainer);
  }
  
  // Existing hover effects (keep these)
  function setupReleaseHoverEffects() {
    document.querySelectorAll('.release').forEach(item => {
      item.addEventListener('mouseenter', () => {
        item.style.transform = 'translateY(-5px)';
      });
      item.addEventListener('mouseleave', () => {
        item.style.transform = 'none';
      });
    });
  }
  
  // Initialize everything when DOM loads
  document.addEventListener('DOMContentLoaded', () => {
    if (!/Mobi|Android/i.test(navigator.userAgent)) {
      createRain(); // Only on desktop
    }
    setupReleaseHoverEffects();
  });