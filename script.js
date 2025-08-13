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
  
  (() => {
    // bump the version when you change the video so returning users see it again
    const STORAGE_KEY = 'promo:krewlty-trailer:v1';
  
    const openModal = () => {
      const modal = document.getElementById('promo-modal');
      if (!modal) return;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
  
      const vid = document.getElementById('promo-video');
      // Try to autoplay (muted helps on mobile); user can unmute
      if (vid) { vid.currentTime = 0; vid.play().catch(() => {}); }
    };
  
    const closeModal = () => {
      const modal = document.getElementById('promo-modal');
      if (!modal) return;
      const vid = document.getElementById('promo-video');
      if (vid) { vid.pause(); }
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
    };
  
    const bindModal = () => {
      const modal = document.getElementById('promo-modal');
      if (!modal) return;
  
      // close on backdrop or X
      modal.addEventListener('click', (e) => {
        if (e.target.dataset.close === 'true') closeModal();
      });
      // close on Esc
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
      });
    };
  
    document.addEventListener('DOMContentLoaded', () => {
      bindModal();
  
      // Show only on first visit (per browser)
      const forceShow = new URLSearchParams(location.search).has('promo'); // ?promo to test
      if (!localStorage.getItem(STORAGE_KEY) || forceShow) {
        // small delay so the page settles
        setTimeout(openModal, 350);
        localStorage.setItem(STORAGE_KEY, '1');
      }
    });
    const vid = document.getElementById('promo-video');
const skel = document.querySelector('.promo-skel');
if (vid) {
  vid.addEventListener('canplay', () => skel && (skel.style.display = 'none'));
}

  })();
  