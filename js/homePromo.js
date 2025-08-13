(() => {
    const STORAGE_KEY = 'promo:krewlty-trailer:v2';
    const SHOW_EVERY_MS = 60 * 60 * 1000; // 1 hour
    const forceShow = new URLSearchParams(location.search).has('promo');
  
    const $ = (s, r = document) => r.querySelector(s);
  
    const openModal = () => {
      const modal = $('#promo-modal');
      if (!modal) return;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
      const vid = $('#promo-video');
      if (vid) { try { vid.currentTime = 0; vid.play(); } catch (_) {} }
    };
  
    const closeModal = () => {
      const modal = $('#promo-modal');
      if (!modal) return;
      const vid = $('#promo-video');
      if (vid) vid.pause();
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
    };
  
    const bindModal = () => {
      const modal = $('#promo-modal');
      if (!modal) return;
      modal.addEventListener('click', (e) => {
        if (e.target.dataset.close === 'true') closeModal();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
        // Dev hotkey: press "P" to replay while testing
        if (e.key.toLowerCase() === 'p' && e.shiftKey) openModal();
      });
  
      const vid = $('#promo-video');
      const skel = $('.promo-skel');
      if (vid) {
        vid.addEventListener('canplay', () => { if (skel) skel.style.display = 'none'; });
      }
    };
  
     const shouldShow = () => {
           if (forceShow) return true;
           const last = Number(localStorage.getItem(STORAGE_KEY) || 0);
           if (!last) return true;
          return (Date.now() - last) >= SHOW_EVERY_MS;
         };
  
    const markShown = () => localStorage.setItem(STORAGE_KEY, String(Date.now()));
  
    document.addEventListener('DOMContentLoaded', () => {
      bindModal();
      if (shouldShow()) {
        setTimeout(() => { openModal(); markShown(); }, 350);
      }
    });
  })();
  