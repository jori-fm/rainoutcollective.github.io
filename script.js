// --- Function to Load External HTML (Footer/Header) ---
// Note: Added "return" so we can chain .then() to it!
function loadComponent(elementId, filePath) {
    return fetch(filePath)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.text();
        })
        .then(data => {
            document.getElementById(elementId).innerHTML = data;
        })
        .catch(error => console.error('Error loading component:', error));
}

// --- 1. Rain Effect Function ---
function createRain() {
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) return;

    const existingRain = document.querySelector('.rain');
    if (existingRain) existingRain.remove();
    
    const rainContainer = document.createElement('div');
    rainContainer.className = 'rain';
    
    for (let i = 0; i < 60; i++) { 
        const drop = document.createElement('div');
        drop.className = 'drop';
        const posX = Math.random() * 100;
        drop.style.cssText = `
            left: ${posX}%;
            animation-delay: ${Math.random() * -2}s; 
            animation-duration: ${Math.random() * 0.5 + 0.8}s;
            opacity: ${Math.random() * 0.3 + 0.2};
        `;
        rainContainer.appendChild(drop);
    }
    
    document.body.prepend(rainContainer);
}

// --- 2. Hover Effects ---
function setupReleaseHoverEffects() {
    if (/Mobi|Android/i.test(navigator.userAgent)) return;

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

    // Added /releases/ to the check so it fixes paths for your album pages too!
    const pathPrefix = (window.location.pathname.includes('/artists/') || window.location.pathname.includes('/releases/')) ? '../' : '';

    // Load the Footer
    loadComponent('global-footer', pathPrefix + 'footer.html');

    // Load the Navbar AND THEN run the nav logic
    loadComponent('global-nav', pathPrefix + 'nav.html').then(() => {
        
        // Highlight active link (Updated to just check the href directly)
        document.querySelectorAll('.site-nav .nav-links a').forEach(a => {
            const linkPath = a.getAttribute('href'); 
            const currentPath = location.pathname.toLowerCase();
            
            if ((linkPath === '/' && (currentPath === '/' || currentPath === '/index.html')) ||
                (linkPath !== '/' && currentPath.startsWith(linkPath))) {
              a.classList.add('active');
            }
        });

        // --- MOBILE MENU TOGGLE ---
        const toggleBtn = document.querySelector('.nav-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                document.body.classList.toggle('nav-open');
            });

            document.addEventListener('click', (e) => {
                if (document.body.classList.contains('nav-open') && !e.target.closest('.site-nav')) {
                    document.body.classList.remove('nav-open');
                }
            });
        }
    });

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
    
    // Recreate rain on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(createRain, 200);
    });
});