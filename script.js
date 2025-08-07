// Rain Effect Function (keep at top)
function createRain() {
    // Remove existing rain if any
    const existingRain = document.querySelector('.rain');
    if (existingRain) existingRain.remove();
    
    // Don't create on mobile
    if (/Mobi|Android/i.test(navigator.userAgent)) return;
    
    const rainContainer = document.createElement('div');
    rainContainer.className = 'rain';
    
    // Create drops (optimized count for performance)
    for (let i = 0; i < 120; i++) {
        const drop = document.createElement('div');
        drop.className = 'drop';
        
        drop.style.cssText = `
            left: ${Math.random() * 100}%;
            height: ${15 + Math.random() * 15}px;
            opacity: ${0.2 + Math.random() * 0.3};
            animation-duration: ${0.7 + Math.random() * 0.8}s;
            animation-delay: ${Math.random() * 5}s;
            filter: blur(${Math.random()}px);
        `;
        
        rainContainer.appendChild(drop);
    }
    
    document.body.prepend(rainContainer); // Add at start of body
}

// Existing hover effects
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

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create rain - the function already has mobile detection
    createRain();
    
    // Then setup other effects
    setupReleaseHoverEffects();
    
    // Flicker effect
    document.querySelectorAll('.release').forEach(release => {
        release.addEventListener('mouseenter', () => {
            release.style.animation = 'flicker 0.8s';
        });
        release.addEventListener('mouseleave', () => {
            release.style.animation = 'none';
        });
    });
    
    // Bonus: Recreate rain on resize to prevent gaps
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(createRain, 200);
    });
});