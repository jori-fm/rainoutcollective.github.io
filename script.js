// Snow Effect Function
function createRain() {
    const existingRain = document.querySelector('.rain');
    if (existingRain) existingRain.remove();
    
    if (/Mobi|Android/i.test(navigator.userAgent)) return;
    
    const rainContainer = document.createElement('div');
    rainContainer.className = 'rain';
    
    // Create snowflakes
    for (let i = 0; i < 150; i++) { // Increased count for a blizzard feel
        const drop = document.createElement('div');
        drop.className = 'drop';
        
        // 1. Make them circular (same width and height)
        const size = Math.random() * 3 + 2; // Random size between 2px and 5px
        
        drop.style.cssText = `
            left: ${Math.random() * 100}%;
            width: ${size}px;
            height: ${size}px;
            opacity: ${Math.random() * 0.6 + 0.2}; 
            /* 2. Much slower fall speed (10s to 20s) */
            animation-duration: ${Math.random() * 10 + 10}s, ${Math.random() * 4 + 3}s;
            animation-delay: -${Math.random() * 20}s; /* Start mid-animation */
        `;
        
        rainContainer.appendChild(drop);
    }
    
    document.body.prepend(rainContainer);
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
    createRain(); // This now creates snow
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
    
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(createRain, 200);
    });
});

// highlight active link
document.querySelectorAll('.site-nav .nav-links a').forEach(a => {
    const m = a.dataset.match; 
    const p = location.pathname.toLowerCase();
    if ((m === '/' && (p === '/' || p === '/index.html')) ||
        (m !== '/' && p.startsWith(m))) {
      a.classList.add('active');
    }
});
  
// mobile toggle
document.querySelector('.nav-toggle')?.addEventListener('click', () => {
    document.body.classList.toggle('nav-open');
});

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

// highlight active link
document.querySelectorAll('.site-nav .nav-links a').forEach(a => {
    const m = a.dataset.match; // "/" | "/releases" | "/shop" | "/about"
    const p = location.pathname.toLowerCase();
    if ((m === '/' && (p === '/' || p === '/index.html')) ||
        (m !== '/' && p.startsWith(m))) {
      a.classList.add('active');
    }
  });
  
  // mobile toggle
  document.querySelector('.nav-toggle')?.addEventListener('click', () => {
    document.body.classList.toggle('nav-open');
  });
  
  