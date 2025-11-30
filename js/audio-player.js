/* RAINOUT Player — Final: Global Playlist + Metadata + UI Fixes */
(() => {
  // --- Helpers ---
  const $ = (id) => document.getElementById(id);
  const fmt = (t = 0) => {
    const s = Math.max(0, Math.floor(t));
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };
  const displayArtist = (name = '') => {
    const n = String(name).trim();
    return /^smooch\.?$/i.test(n) ? 'smooch.' : n;
  };

  // --- Elements ---
  const el = {
    list: $("releaseList"),
    nowbar: $("nowbar"),
    audio: $("apAudio"),
    title: $("apTitle"),
    sub: $("apSub"),
    cover: $("apCover"),
    play: $("apPlay"),
    prev: $("apPrev"),
    next: $("apNext"),
    repeat: $("apRepeat"),
    shuffle: $("apShuffle"),
    seek: $("apSeek"),
    cur: $("apCurrent"),
    dur: $("apDuration"),
    vol: $("apVolume"),
  };

  // --- State ---
  let playlist = [];       // One flat list of ALL tracks
  let currentIndex = 0;    // Where we are in that flat list
  let repeatMode = 0;      // 0=off, 1=all, 2=one
  let shuffleOn = false;

// --- METADATA (Browser Tab & Lock Screen) ---
function updateMetadata(track) {
  // 1. Browser Tab
  if (document) {
      document.title = `${track.artist} - ${track.title} - RAINOUT`;
  }

  // 2. Lock Screen / Media Session
  if ('mediaSession' in navigator) {
      // Helper: Convert relative path (e.g., /assets/img.jpg) to Absolute URL (https://site.com/assets/img.jpg)
      const getAbsoluteUrl = (url) => {
          // If it's already a full URL, return it. Otherwise, combine with current website address.
          if (!url) return '';
          return new URL(url, window.location.href).href;
      };

      navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title,
          artist: track.artist,
          album: track.album,
          artwork: [
              // Send the full URL so the phone can find the image
              // Removed 'type' so it accepts both JPG and PNG automatically
              { src: getAbsoluteUrl(track.cover), sizes: '96x96' },
              { src: getAbsoluteUrl(track.cover), sizes: '128x128' },
              { src: getAbsoluteUrl(track.cover), sizes: '192x192' },
              { src: getAbsoluteUrl(track.cover), sizes: '256x256' },
              { src: getAbsoluteUrl(track.cover), sizes: '384x384' },
              { src: getAbsoluteUrl(track.cover), sizes: '512x512' },
          ]
      });

      navigator.mediaSession.setActionHandler('play', () => { 
          if(el.audio.paused) el.audio.play(); 
      });
      navigator.mediaSession.setActionHandler('pause', () => { 
          if(!el.audio.paused) el.audio.pause(); 
      });
      navigator.mediaSession.setActionHandler('previoustrack', prevTrack);
      navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
  }
}

  // --- CORE PLAYER LOGIC ---

  function loadTrack(index) {
    // Bounds check
    if (index < 0) index = playlist.length - 1;
    if (index >= playlist.length) index = 0;

    currentIndex = index;
    const track = playlist[currentIndex];

    // Update UI
    el.audio.src = track.file;
    el.cover.src = track.cover;
    el.title.textContent = track.title;
    el.sub.textContent = `${track.artist} • ${track.album}`;

    // Update Metadata
    updateMetadata(track);

    // Play
    el.audio.play().catch(e => console.error("Playback error:", e));
    
    // Show Player Bar
    if (el.nowbar) {
        el.nowbar.hidden = false;
        el.nowbar.classList.add('is-open');
        document.body.classList.add('has-nowbar');
    }
    updatePlayBtn();
  }

  function updatePlayBtn() {
    if (!el.play) return;
    if (!el.audio.paused) {
        el.play.textContent = "❚❚";
        el.play.setAttribute("aria-label", "Pause");
    } else {
        el.play.textContent = "►";
        el.play.setAttribute("aria-label", "Play");
    }
  }

  function nextTrack() {
    if (repeatMode === 2) { // Repeat One
        el.audio.currentTime = 0;
        el.audio.play();
    } else if (shuffleOn) {
        const rand = Math.floor(Math.random() * playlist.length);
        loadTrack(rand);
    } else {
        // Loop back to start if at end, or stop if repeat off? 
        // Standard behavior is usually loop or stop. Let's loop for "continuous play" feel.
        loadTrack(currentIndex + 1);
    }
  }

  function prevTrack() {
    if (el.audio.currentTime > 3) {
        el.audio.currentTime = 0;
    } else {
        loadTrack(currentIndex - 1);
    }
  }

  // --- INIT & RENDER ---

  function init() {
    fetch("/tracks.json")
      .then(res => res.json())
      .then(data => {
        // 1. Sort Releases (Newest First)
        const sortedReleases = data.sort((a, b) => {
            return new Date(b.release_date) - new Date(a.release_date);
        });

        // 2. Build Global Playlist & DOM
        if (el.list) el.list.innerHTML = "";
        
        let globalTrackCounter = 0; // Keeps track of the index in the master playlist

        sortedReleases.forEach((release) => {
            // -- Build UI Card --
            const card = document.createElement("div");
            card.className = "ap-card";

            // HTML Structure
            let tracksHtml = "";
            release.tracks.forEach((track, i) => {
                // Add to Master Playlist
                playlist.push({
                    title: track.title,
                    file: track.file,
                    cover: release.cover,
                    artist: displayArtist(release.artist),
                    album: release.title,
                    catalog: release.catalog
                });

                // Capture the current index for the click handler
                const trackIndex = globalTrackCounter; 
                
                tracksHtml += `
                    <li class="ap-track">
                        <span class="ap-track-num">${i + 1}.</span>
                        <span class="ap-track-title">${track.title}</span>
                        <button class="ap-play" onclick="window.rainoutPlay(${trackIndex})">▶</button>
                    </li>
                `;
                
                globalTrackCounter++;
            });

            const leftDiv = document.createElement("div");
            leftDiv.className = "ap-left";
            leftDiv.innerHTML = `<img src="${release.cover}" class="ap-cover" alt="${release.title}">`;

            const rightDiv = document.createElement("div");
            rightDiv.className = "ap-right";
            rightDiv.innerHTML = `
                <div class="ap-title">${release.title}</div>
                <div class="ap-meta-line">
                    ${displayArtist(release.artist)} <span class="ap-dot">•</span> ${release.catalog} <span class="ap-dot">•</span> ${release.release_date}
                </div>
                <ul class="ap-tracks">
                    ${tracksHtml}
                </ul>
            `;

            card.appendChild(leftDiv);
            card.appendChild(rightDiv);
            el.list.appendChild(card);
        });

      })
      .catch(err => console.error("Error loading tracks:", err));

    // --- Event Listeners ---

    // Global Play Function (Accessible from HTML onClick)
    window.rainoutPlay = (index) => {
        loadTrack(index);
    };

    // Play/Pause
    if (el.play) {
        el.play.addEventListener("click", () => {
            el.audio.paused ? el.audio.play() : el.audio.pause();
        });
    }
    
    // Audio Events
    if (el.audio) {
        el.audio.addEventListener('play', updatePlayBtn);
        el.audio.addEventListener('pause', updatePlayBtn);
        el.audio.addEventListener('ended', nextTrack); // <--- THIS makes it play the next song!
        
        // Time & Seek
        el.audio.addEventListener("timeupdate", () => {
            if (el.seek && !el.seek.dragging) {
                if(el.cur) el.cur.textContent = fmt(el.audio.currentTime);
                if(el.audio.duration) {
                    const pct = (el.audio.currentTime / el.audio.duration) * 1000;
                    el.seek.value = pct || 0;
                }
            }
        });
        
        el.audio.addEventListener("loadedmetadata", () => {
            if (el.dur) el.dur.textContent = fmt(el.audio.duration);
        });
    }
    
    // Nav
    if (el.next) el.next.addEventListener('click', nextTrack);
    if (el.prev) el.prev.addEventListener('click', prevTrack);

    // Repeat & Shuffle
    if (el.repeat) {
        el.repeat.addEventListener("click", () => {
            repeatMode = (repeatMode + 1) % 3;
            el.repeat.setAttribute("aria-pressed", repeatMode !== 0);
            // 0=Off, 1=All (Loop), 2=One
            el.repeat.setAttribute("data-mode", repeatMode); 
        });
    }

    if (el.shuffle) {
        el.shuffle.addEventListener("click", () => {
            shuffleOn = !shuffleOn;
            el.shuffle.setAttribute("aria-pressed", shuffleOn);
        });
    }

    if (el.seek) {
        el.seek.addEventListener("input", () => {
            el.seek.dragging = true;
            if(el.audio.duration) el.cur.textContent = fmt((el.seek.value / 1000) * el.audio.duration);
        });
        el.seek.addEventListener("change", () => {
            if(el.audio.duration) el.audio.currentTime = (el.seek.value / 1000) * el.audio.duration;
            el.seek.dragging = false;
        });
    }

    if (el.vol) {
        el.vol.addEventListener("input", () => {
            el.audio.volume = el.vol.value;
        });
    }
  }

  // Start
  init();
})();