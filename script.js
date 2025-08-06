function createRain() {
    if (document.querySelector('.rain')) return;
    
    const rainContainer = document.createElement('div');
    rainContainer.className = 'rain';
    
    // Create more drops for better coverage
    for (let i = 0; i < 150; i++) {
        const drop = document.createElement('div');
        drop.className = 'drop';
        
        // Randomize properties
        const left = Math.random() * 100;
        const height = Math.random() * 20 + 10;
        const opacity = Math.random() * 0.5 + 0.3;
        const animationDuration = Math.random() * 0.5 + 0.5;
        const animationDelay = Math.random() * 5;
        
        drop.style.left = `${left}%`;
        drop.style.height = `${height}px`;
        drop.style.opacity = opacity;
        drop.style.animationDuration = `${animationDuration}s`;
        drop.style.animationDelay = `${animationDelay}s`;
        
        // Add slight horizontal movement for more natural rain
        drop.style.transform = `translateX(${Math.random() * 10 - 5}px)`;
        
        rainContainer.appendChild(drop);
    }
    
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