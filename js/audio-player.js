/* RAINOUT Player — Fixed to handle your tracks.json structure */
(() => {
  // Helper functions
  const $ = (id) => document.getElementById(id);
  const fmt = (t = 0) => {
    const s = Math.max(0, Math.floor(t));
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };
  const displayArtist = (name = '') => {
    const n = String(name).trim();
    return /^smooch\.?$/i.test(n) ? 'smooch.' : n;
  };

  // Elements
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

  // State
  let releases = [];      // Your album/release data
  let currentRelease = -1; // Current release index
  let currentTrack = 0;    // Current track index within release
  let repeatMode = 0;      // 0=off, 1=all, 2=one
  let shuffleOn = false;

  // Render release list
  function renderReleases() {
    if (!el.list) return;
    el.list.innerHTML = "";

    releases.forEach((release, idx) => {
      const card = document.createElement("div");
      card.className = "ap-card";
      
      // Cover image
      const left = document.createElement("div");
      left.className = "ap-left";
      const img = document.createElement("img");
      img.className = "ap-cover";
      img.src = release.cover;
      img.alt = `${release.title} cover`;
      left.appendChild(img);
      
      // Release info
      const right = document.createElement("div");
      right.className = "ap-right";
      
      const title = document.createElement("div");
      title.className = "ap-title";
      title.textContent = release.title;
      
      const meta = document.createElement("div");
      meta.className = "ap-meta-line";
      meta.innerHTML = `${displayArtist(release.artist)} <span class="ap-dot">•</span> ${release.catalog} <span class="ap-dot">•</span> ${release.release_date}`;
      
      // Track list
      const trackList = document.createElement("ul");
      trackList.className = "ap-tracks";
      
      release.tracks.forEach((track, trackIdx) => {
        const li = document.createElement("li");
        li.className = "ap-track";
        li.innerHTML = `<span class="ap-track-num">${trackIdx + 1}.</span>
                        <span class="ap-track-title">${track.title}</span>
                        <button class="ap-play" data-release="${idx}" data-track="${trackIdx}">▶</button>`;
        trackList.appendChild(li);
      });
      
      right.appendChild(title);
      right.appendChild(meta);
      right.appendChild(trackList);
      
      card.appendChild(left);
      card.appendChild(right);
      el.list.appendChild(card);
    });

    // Add play button listeners
    document.querySelectorAll(".ap-play").forEach(btn => {
      btn.addEventListener("click", () => {
        const releaseIdx = parseInt(btn.dataset.release);
        const trackIdx = parseInt(btn.dataset.track);
        playTrack(releaseIdx, trackIdx);
      });
    });
  }

  // Play a specific track
  function playTrack(releaseIdx, trackIdx) {
    if (!releases[releaseIdx] || !releases[releaseIdx].tracks[trackIdx]) return;
    
    currentRelease = releaseIdx;
    currentTrack = trackIdx;
    
    const release = releases[releaseIdx];
    const track = release.tracks[trackIdx];
    
    // Update UI
    el.cover.src = release.cover;
    el.title.textContent = track.title;
    el.sub.textContent = `${displayArtist(release.artist)} • ${release.title}`;
    el.audio.src = track.file;
    
    // Show player and start playback
    if (el.nowbar) {
      el.nowbar.hidden = false;
      el.nowbar.classList.add('is-open'); // Add this to trigger the slide-up animation
      document.body.classList.add('has-nowbar'); // Add this for proper spacing
    }
    
    el.audio.play().catch(e => console.log("Playback error:", e));
    updatePlayBtn();
  }

  // Update play/pause button
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

  // Next track
  function nextTrack() {
    if (!releases[currentRelease]) return;
    
    const release = releases[currentRelease];
    
    if (currentTrack < release.tracks.length - 1) {
      playTrack(currentRelease, currentTrack + 1);
    } else if (repeatMode === 1) {
      playTrack(currentRelease, 0);
    } else {
      // Stop at end if repeat is off
      el.audio.pause();
      updatePlayBtn();
    }
  }

  // Previous track
  function prevTrack() {
    if (el.audio.currentTime > 3) {
      // Restart current track if >3 seconds in
      playTrack(currentRelease, currentTrack);
    } else if (currentTrack > 0) {
      playTrack(currentRelease, currentTrack - 1);
    } else if (repeatMode === 1) {
      const release = releases[currentRelease];
      playTrack(currentRelease, release.tracks.length - 1);
    }
  }

  // Initialize player
  function init() {
    // Load tracks.json
    fetch("/tracks.json")
      .then(response => {
        if (!response.ok) throw new Error("Failed to load tracks");
        return response.json();
      })
      .then(data => {
        // Sort releases from newest to oldest
        releases = data.sort((a, b) => {
          const dateA = new Date(a.release_date);
          const dateB = new Date(b.release_date);
          return dateB - dateA; // Newest first
        });
        
        renderReleases();
      })
      .catch(error => {
        console.error("Error loading tracks:", error);
        if (el.list) {
          el.list.innerHTML = `<p class="error-state">Error loading music: ${error.message}</p>`;
        }
      });

    // Event listeners
    if (el.play) {
      el.play.addEventListener("click", () => {
        if (el.audio.paused) {
          if (currentRelease === -1 && releases.length > 0) {
            playTrack(0, 0); // Play first track if nothing is playing
          } else {
            el.audio.play().catch(e => console.log("Play error:", e));
          }
        } else {
          el.audio.pause();
        }
      });
    }

    if (el.prev) el.prev.addEventListener("click", prevTrack);
    if (el.next) el.next.addEventListener("click", nextTrack);

    if (el.repeat) {
      el.repeat.addEventListener("click", () => {
        repeatMode = (repeatMode + 1) % 3;
        el.repeat.setAttribute("aria-pressed", repeatMode !== 0);
        el.repeat.title = ["Repeat: Off", "Repeat: All", "Repeat: One"][repeatMode];
      });
    }

    if (el.shuffle) {
      el.shuffle.addEventListener("click", () => {
        shuffleOn = !shuffleOn;
        el.shuffle.setAttribute("aria-pressed", shuffleOn);
      });
    }

    el.audio.addEventListener("timeupdate", () => {
      if (!el.seek || !el.cur) return;
      if (!el.seek.dragging) {
        el.cur.textContent = fmt(el.audio.currentTime);
        if (el.audio.duration) {
          el.seek.value = (el.audio.currentTime / el.audio.duration) * 1000 || 0;
        }
      }
    });

    el.audio.addEventListener("loadedmetadata", () => {
      if (!el.dur || !el.seek) return;
      el.dur.textContent = fmt(el.audio.duration);
      el.seek.max = 1000;
    });

    el.audio.addEventListener("ended", nextTrack);

    if (el.seek) {
      el.seek.addEventListener("input", () => {
        el.seek.dragging = true;
        if (el.audio.duration) {
          const seekTo = (el.seek.value / 1000) * el.audio.duration;
          if (el.cur) el.cur.textContent = fmt(seekTo);
        }
      });

      el.seek.addEventListener("change", () => {
        if (el.audio.duration) {
          const seekTo = (el.seek.value / 1000) * el.audio.duration;
          el.audio.currentTime = seekTo;
        }
        el.seek.dragging = false;
      });
    }

    if (el.vol) {
      el.audio.volume = Number(el.vol.value || 0.9);
      el.vol.addEventListener("input", () => {
        el.audio.volume = Number(el.vol.value);
      });
    }
  }

  // Start everything
  init();
})();