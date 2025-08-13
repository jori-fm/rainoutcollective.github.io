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
  