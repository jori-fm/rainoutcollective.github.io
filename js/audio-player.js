// --- helpers ---
function asLocalDate(isoYmd) {
    const [y,m,d] = String(isoYmd).split('-').map(Number);
    return new Date(y, (m||1)-1, d||1);
  }
  function fmtTime(sec=0){
    sec = Math.max(0, Math.floor(sec));
    const m = Math.floor(sec/60), s = sec%60;
    return `${m}:${String(s).padStart(2,'0')}`;
  }
  
  // --- state ---
  const state = {
    releases: [],
    releaseIdx: -1,
    trackIdx: -1,
  };
  
  // --- DOM ---
  const listEl    = document.getElementById('releaseList');
  const barEl     = document.getElementById('nowbar');
  const audioEl   = document.getElementById('apAudio');
  const playBtn   = document.getElementById('apPlay');
  const coverEl   = document.getElementById('apCover');
  const titleEl   = document.getElementById('apTitle');
  const subEl     = document.getElementById('apSub');
  const seekEl    = document.getElementById('apSeek');
  const currentEl = document.getElementById('apCurrent');
  const durEl     = document.getElementById('apDuration');
  const volEl     = document.getElementById('apVolume');
  
  document.addEventListener('DOMContentLoaded', () => {
    fetch('/tracks.json')
      .then(r => r.json())
      .then(data => {
        // newest -> oldest
        state.releases = [...data].sort((a,b) =>
          asLocalDate(b.release_date) - asLocalDate(a.release_date)
        );
        renderReleases();
      })
      .catch(err => {
        listEl.innerHTML = `<div class="error-state">Couldn’t load tracks.json</div>`;
        console.error(err);
      });
  });
  
  function renderReleases(){
    listEl.innerHTML = '';
    state.releases.forEach((r, ri) => {
      const d = asLocalDate(r.release_date);
      const nice = isNaN(d) ? r.release_date :
        d.toLocaleDateString(undefined,{year:'numeric',month:'short',day:'2-digit'});
  
      const card = document.createElement('article');
      card.className = 'ap-card';
  
      card.innerHTML = `
        <div class="ap-left">
          <img class="ap-cover" src="${r.cover}" alt="${r.title} cover">
        </div>
        <div class="ap-right">
          <div class="ap-head">
            <div class="ap-title">${r.title}</div>
            <div class="ap-meta-line">
              <span class="ap-artist">${r.artist}</span>
              <span class="ap-dot">•</span>
              <span class="ap-cat">${r.catalog}</span>
              <span class="ap-dot">•</span>
              <span class="ap-date">${nice}</span>
            </div>
          </div>
          <ul class="ap-tracks">
            ${Array.isArray(r.tracks) && r.tracks.length
              ? r.tracks.map((t, ti) => `
                <li class="ap-track">
                  <button class="ap-play" data-ri="${ri}" data-ti="${ti}">Play</button>
                  <span class="ap-track-title">${t.title}</span>
                </li>
              `).join('')
              : `<li class="ap-track ap-empty">No tracks added yet.</li>`
            }
          </ul>
        </div>
      `;
      listEl.appendChild(card);
    });
  
    // wire play buttons
    listEl.querySelectorAll('.ap-play').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const ri = Number(btn.dataset.ri);
        const ti = Number(btn.dataset.ti);
        playTrack(ri, ti);
      });
    });
  }
  
  function playTrack(ri, ti){
    const rel = state.releases[ri];
    if (!rel || !rel.tracks || !rel.tracks[ti]) return;
  
    state.releaseIdx = ri;
    state.trackIdx   = ti;
  
    const tr = rel.tracks[ti];
    // UI
    barEl.hidden = false;
    coverEl.src  = rel.cover;
    titleEl.textContent = tr.title;
    subEl.textContent   = `${rel.artist} • ${rel.title} • ${rel.catalog}`;
  
    // audio
    audioEl.src = tr.file;
    audioEl.play().catch(()=>{ /* autoplay fail on some mobile until user gesture */ });
  
    // set play button state
    setPlayIcon();
  }
  
  function setPlayIcon(){
    playBtn.textContent = audioEl.paused ? '►' : '❚❚';
  }
  
  // play/pause toggle
  playBtn.addEventListener('click', ()=>{
    if (audioEl.paused) audioEl.play(); else audioEl.pause();
    setPlayIcon();
  });
  
  // volume
  volEl.addEventListener('input', ()=>{
    audioEl.volume = Number(volEl.value);
  });
  
  // progress updates
  audioEl.addEventListener('timeupdate', ()=>{
    const cur = audioEl.currentTime || 0;
    const dur = audioEl.duration || 0;
    currentEl.textContent = fmtTime(cur);
    durEl.textContent     = dur ? fmtTime(dur) : '0:00';
    seekEl.value = dur ? Math.floor((cur/dur)*1000) : 0;
  });
  
  seekEl.addEventListener('input', ()=>{
    const dur = audioEl.duration || 0;
    if (!dur) return;
    const ratio = Number(seekEl.value)/1000;
    audioEl.currentTime = dur * ratio;
  });
  
  audioEl.addEventListener('play',  setPlayIcon);
  audioEl.addEventListener('pause', setPlayIcon);
  
  // auto-next within the same release
  audioEl.addEventListener('ended', ()=>{
    const r = state.releases[state.releaseIdx];
    if (!r) return;
    const next = state.trackIdx + 1;
    if (r.tracks && next < r.tracks.length) {
      playTrack(state.releaseIdx, next);
    } else {
      // reached end
      setPlayIcon();
    }
  });
  