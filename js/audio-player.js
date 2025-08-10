/* RAINOUT Player — Prev/Next + Repeat + Shuffle
 * Works with /tracks.json
 * Expected track fields (with fallbacks):
 *   title, artist, catno, date, cover, src, subtitle
 */

(() => {
  // ---------- helpers ----------
  const $ = (id) => document.getElementById(id);
  const fmt = (t=0) => {
    const s = Math.max(0, Math.floor(t));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m + ":" + (r < 10 ? "0" + r : r);
  };

  // ---------- elements ----------
  const el = {
    list:   $("releaseList"),
    nowbar: $("nowbar"),
    audio:  $("apAudio"),
    title:  $("apTitle"),
    sub:    $("apSub"),
    cover:  $("apCover"),
    play:   $("apPlay"),
    prev:   $("apPrev"),
    next:   $("apNext"),
    repeat: $("apRepeat"),
    shuffle:$("apShuffle"),
    seek:   $("apSeek"),
    cur:    $("apCurrent"),
    dur:    $("apDuration"),
    vol:    $("apVolume"),
  };

  // guard (don’t crash if markup missing)
  for (const k in el) {
    if (!el[k]) console.warn("[player] missing element:", k);
  }

  // ---------- state ----------
  let tracks = [];        // as loaded from /tracks.json (array of objects)
  let order = [];         // array of indices into `tracks` describing play order
  let current = 0;        // index into `order`
  let repeatMode = 0;     // 0=off, 1=all, 2=one
  let shuffleOn = false;

  function initOrder() {
    order = tracks.map((_, i) => i);
    current = 0;
  }

  function shuffleArray(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function rebuildOrderKeepingCurrent() {
    const curIdx = order[current] ?? 0;
    let rest = tracks.map((_, i) => i).filter(i => i !== curIdx);
    if (shuffleOn) shuffleArray(rest);
    order = [curIdx, ...rest];
    current = 0;
  }

  // ---------- rendering ----------
  function renderList() {
    if (!el.list) return;
    el.list.innerHTML = "";

    tracks.forEach((t, i) => {
      const card = document.createElement("div");
      card.className = "ap-card";

      const img = document.createElement("img");
      img.className = "ap-card-cover";
      img.src = t.cover || "";
      img.alt = (t.title || "Track") + " cover";

      const body = document.createElement("div");
      body.className = "ap-card-body";

      const h = document.createElement("div");
      h.className = "ap-card-title";
      h.textContent = t.title || "Untitled";

      const sub = document.createElement("div");
      sub.className = "ap-card-sub";
      const bits = [];
      if (t.artist) bits.push(t.artist);
      if (t.catno) bits.push(t.catno);
      if (t.date)  bits.push(t.date);
      sub.textContent = t.subtitle || bits.join(" • ");

      const btn = document.createElement("button");
      btn.className = "ap-btn";
      btn.textContent = "Play";
      btn.addEventListener("click", () => startPlaybackAt(i));

      body.appendChild(h);
      body.appendChild(sub);
      body.appendChild(btn);

      card.appendChild(img);
      card.appendChild(body);
      el.list.appendChild(card);
    });
  }

  // ---------- core playback ----------
  function applyTrackUI(t) {
    el.title.textContent = t.title || "Untitled";
    const bits = [];
    if (t.artist) bits.push(t.artist);
    if (t.catno) bits.push(t.catno);
    el.sub.textContent = t.subtitle || bits.join(" • ");
    if (t.cover) el.cover.src = t.cover;
    el.nowbar.hidden = false;
    document.title = `${t.title || "Track"} — RAINOUT Player`;
  }

  function loadTrackByOrderIndex(ordIdx, autoplay = true) {
    el.nowbar.hidden = false;
el.nowbar.classList.add('is-open');
document.body.classList.add('has-nowbar');
    current = ordIdx;
    const t = tracks[order[current]];
    if (!t) return;
    // required: t.src
    el.audio.src = t.src;
    applyTrackUI(t);
    if (autoplay) {
      el.audio.play().catch(() => {/* ignore autoplay block */});
      updatePlayBtn();
    }
  }

  function nextTrack() {
    if (repeatMode === 2) {
      return loadTrackByOrderIndex(current);
    }
    if (current < order.length - 1) {
      return loadTrackByOrderIndex(current + 1);
    }
    if (repeatMode === 1) {
      return loadTrackByOrderIndex(0);
    }
    // off: stop at end
    el.audio.pause();
    updatePlayBtn();
  }

  function prevTrack() {
    if (el.audio.currentTime > 3) {
      // restart current
      return loadTrackByOrderIndex(current);
    }
    if (current > 0) {
      return loadTrackByOrderIndex(current - 1);
    }
    if (repeatMode === 1) {
      return loadTrackByOrderIndex(order.length - 1);
    }
    loadTrackByOrderIndex(current);
  }

  function startPlaybackAt(trackIdx) {
    const ordIdx = order.indexOf(trackIdx);
    if (ordIdx === -1) {
      initOrder();
      rebuildOrderKeepingCurrent();
      return loadTrackByOrderIndex(0);
    }
    loadTrackByOrderIndex(ordIdx);
  }

  function updatePlayBtn() {
    const playing = !el.audio.paused;
    el.play.textContent = playing ? "❚❚" : "►";
    el.play.setAttribute("aria-label", playing ? "Pause" : "Play");
  }

  // ---------- wire controls ----------
  el.play?.addEventListener("click", () => {
    if (el.audio.paused) el.audio.play().catch(()=>{});
    else el.audio.pause();
  });

  el.prev?.addEventListener("click", prevTrack);
  el.next?.addEventListener("click", nextTrack);

  el.repeat?.addEventListener("click", () => {
    repeatMode = (repeatMode + 1) % 3; // 0 -> 1 -> 2 -> 0
    const titles = ["Repeat: Off", "Repeat: All", "Repeat: One"];
    el.repeat.title = titles[repeatMode];
    el.repeat.dataset.mode = String(repeatMode);
    el.repeat.setAttribute("aria-pressed", repeatMode !== 0);
  });

  el.shuffle?.addEventListener("click", () => {
    shuffleOn = !shuffleOn;
    el.shuffle.setAttribute("aria-pressed", shuffleOn);
    rebuildOrderKeepingCurrent();
  });

  // audio events
  el.audio?.addEventListener("play", updatePlayBtn);
  el.audio?.addEventListener("pause", updatePlayBtn);

  el.audio?.addEventListener("loadedmetadata", () => {
    el.dur.textContent = fmt(el.audio.duration);
    el.seek.max = Math.max(1, Math.floor(el.audio.duration * 1000));
  });

  el.audio?.addEventListener("timeupdate", () => {
    el.cur.textContent = fmt(el.audio.currentTime);
    if (!el.seek.dragging) {
      const val = Math.floor(el.audio.currentTime * 1000);
      el.seek.value = String(val);
    }
  });

  el.audio?.addEventListener("ended", nextTrack);

  // seek/volume
  el.seek?.addEventListener("input", () => {
    el.seek.dragging = true;
  });
  el.seek?.addEventListener("change", () => {
    const v = Number(el.seek.value) / 1000;
    el.audio.currentTime = v;
    el.seek.dragging = false;
  });

  if (el.vol) {
    el.audio.volume = Number(el.vol.value || 0.9);
    el.vol.addEventListener("input", () => {
      el.audio.volume = Number(el.vol.value);
    });
  }

  // ---------- boot ----------
  fetch("/tracks.json")
    .then(r => {
      if (!r.ok) throw new Error("Failed to load /tracks.json");
      return r.json();
    })
    .then(json => {
      // Accept either { tracks: [...] } or just [...]
      tracks = Array.isArray(json) ? json : (json.tracks || []);
      if (!Array.isArray(tracks)) tracks = [];

      // normalize minimal fields we use
      tracks = tracks.map(t => ({
        title: t.title || t.name || "Untitled",
        artist: t.artist || t.by || "",
        catno: t.catno || t.catalog || t.catalog_number || "",
        date:  t.date || t.release_date || "",
        cover: t.cover || t.image || t.art || "",
        src:   t.src || t.url || t.audio || "",
        subtitle: t.subtitle || t.sub || ""
      })).filter(t => t.src);

      initOrder();
      renderList();
    })
    .catch(err => {
      console.error("[player] tracks load error:", err);
      if (el.list) el.list.innerHTML = "<p style='opacity:.7'>Could not load tracks.</p>";
    });
})();
