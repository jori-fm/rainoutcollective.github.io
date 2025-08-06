function createRain() {
    // Remove existing rain if any
    const existingRain = document.querySelector('.rain');
    if (existingRain) existingRain.remove();
    
    const rainContainer = document.createElement('div');
    rainContainer.className = 'rain';
    
    // Create more drops with better randomization
    for (let i = 0; i < 200; i++) { // Increased number of drops
        const drop = document.createElement('div');
        drop.className = 'drop';
        
        // Random properties
        const left = Math.random() * 100;
        const height = Math.random() * 25 + 10; // Longer drops
        const opacity = Math.random() * 0.6 + 0.2; // More visible
        const duration = Math.random() * 0.8 + 0.3; // Vary speeds more
        const delay = Math.random() * 10; // Wider delay range
        
        drop.style.left = `${left}%`;
        drop.style.height = `${height}px`;
        drop.style.opacity = opacity;
        drop.style.animationDuration = `${duration}s`;
        drop.style.animationDelay = `${delay}s`;
        
        // Add slight horizontal movement
        drop.style.transform = `translateX(${Math.random() * 10 - 5}px)`;
        
        rainContainer.appendChild(drop);
    }
    
    document.body.appendChild(rainContainer); // Append to body
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
    // Create rain effect (only on desktop)
    if (!/Mobi|Android/i.test(navigator.userAgent)) {
        createRain();
    }
    
    // Existing effects
    setupReleaseHoverEffects();
    
    // Add flickering effect to releases
    document.querySelectorAll('.release').forEach(release => {
        release.addEventListener('mouseenter', () => {
            release.style.animation = 'flicker 0.8s';
        });
        release.addEventListener('mouseleave', () => {
            release.style.animation = 'none';
        });
    });
});