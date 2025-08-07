function createRain() {
    // Remove existing rain if any
    const existingRain = document.querySelector('.rain');
    if (existingRain) existingRain.remove();
    
    // Don't create rain on mobile
    if (/Mobi|Android/i.test(navigator.userAgent)) return;
    
    const rainContainer = document.createElement('div');
    rainContainer.className = 'rain';
    
    // Create more dynamic rain
    const rainIntensity = 150; // Number of drops
    for (let i = 0; i < rainIntensity; i++) {
        const drop = document.createElement('div');
        drop.className = 'drop';
        
        // Random properties
        const left = Math.random() * 100;
        const height = Math.random() * 20 + 10;
        const opacity = Math.random() * 0.4 + 0.2;
        const duration = Math.random() * 0.5 + 0.5;
        const delay = Math.random() * 5;
        const blur = Math.random() * 2;
        
        drop.style.cssText = `
            left: ${left}%;
            height: ${height}px;
            opacity: ${opacity};
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
            filter: blur(${blur}px);
            transform: translateX(${Math.random() * 10 - 5}px);
        `;
        
        rainContainer.appendChild(drop);
    }
    
    document.body.appendChild(rainContainer);
}


document.addEventListener('DOMContentLoaded', () => {
    createRain(); // Always try to create rain
  
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
  
  // Remove the duplicate DOMContentLoaded listener
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