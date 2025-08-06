// Rain Effect (add this to script.js)
function createRain() {
    if (document.querySelector('.rain')) return;
    
    const rainContainer = document.createElement('div');
    rainContainer.className = 'rain';
    rainContainer.style.display = 'block'; // Explicitly set
    
    // Increase number of drops for better visibility
    for (let i = 0; i < 100; i++) {
        const drop = document.createElement('div');
        drop.className = 'drop';
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.height = `${Math.random() * 20 + 15}px`; // Slightly longer drops
        drop.style.animationDelay = `${Math.random() * 5}s`;
        drop.style.animationDuration = `${Math.random() * 0.7 + 0.5}s`; // Faster animation
        rainContainer.appendChild(drop);
    }
    
    // Insert at beginning of body to ensure proper stacking
    document.body.insertBefore(rainContainer, document.body.firstChild);
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
  
  document.addEventListener('DOMContentLoaded', () => {
    // First create rain to ensure it's below content but above background
    if (!/Mobi|Android/i.test(navigator.userAgent)) {
        createRain();
    }
    
    // Then setup other effects
    setupReleaseHoverEffects();
    
    // Make sure rain is visible by forcing display
    const rain = document.querySelector('.rain');
    if (rain) rain.style.display = 'block';
});