// --- Function to Load External HTML (Footer/Header) ---
function loadComponent(elementId, filePath) {
    fetch(filePath)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.text();
        })
        .then(data => {
            document.getElementById(elementId).innerHTML = data;
        })
        .catch(error => console.error('Error loading component:', error));
}

// --- 1. Snow Effect Function ---
function createRain() {
    const existingRain = document.querySelector('.rain');
    if (existingRain) existingRain.remove();
    
    // Don't create on mobile to save battery
    if (/Mobi|Android/i.test(navigator.userAgent)) return;
    
    const rainContainer = document.createElement('div');
    rainContainer.className = 'rain';
    
    // Create snowflakes
    for (let i = 0; i < 150; i++) { 
        const drop = document.createElement('div');
        drop.className = 'drop';
        
        // 1. Make them circular (same width and height)
        const size = Math.random() * 3 + 2; 
        
        drop.style.cssText = `
            left: ${Math.random() * 100}%;
            width: ${size}px;
            height: ${size}px;
            opacity: ${Math.random() * 0.6 + 0.2}; 
            /* 2. Much slower fall speed (10s to 20s) */
            animation-duration: ${Math.random() * 10 + 10}s, ${Math.random() * 4 + 3}s;
            animation-delay: -${Math.random() * 20}s; 
        `;
        
        rainContainer.appendChild(drop);
    }
    
    document.body.prepend(rainContainer);
}

// --- 2. Hover Effects ---
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

// --- 3. MAIN INITIALIZATION (Runs when page is ready) ---
document.addEventListener('DOMContentLoaded', () => {

    // 1. Load the Footer
    // Check if we are inside the "artists" folder
const pathPrefix = window.location.pathname.includes('/artists/') ? '../' : '';

// Load footer using the correct prefix
loadComponent('global-footer', pathPrefix + 'footer.html');
    // Start Effects
    createRain(); 
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
    
    // Highlight active link
    document.querySelectorAll('.site-nav .nav-links a').forEach(a => {
        const m = a.dataset.match; 
        const p = location.pathname.toLowerCase();
        if ((m === '/' && (p === '/' || p === '/index.html')) ||
            (m !== '/' && p.startsWith(m))) {
          a.classList.add('active');
        }
    });

    // --- FIX: MOBILE MENU TOGGLE ---
    // We put this inside DOMContentLoaded to ensure the button exists
    const toggleBtn = document.querySelector('.nav-toggle');
    
    if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent click from bubbling
            document.body.classList.toggle('nav-open');
        });

        // Optional: Close menu if clicking anywhere else on the page
        document.addEventListener('click', (e) => {
            if (document.body.classList.contains('nav-open') && !e.target.closest('.site-nav')) {
                document.body.classList.remove('nav-open');
            }
        });
    }
    
    // Recreate snow on resize (Debounced)
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(createRain, 200);
    });
});