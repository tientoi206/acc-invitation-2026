/* ============ MỞ THIỆP: CHÓI SÁNG TRÀN KÍN ============ */
let isOpening = false;
function openCard() {
  if (isOpening) return;
  isOpening = true;

  // Phát nhạc đầu tiên, ngay trong cú bấm
  tryPlayMusic();

  const opening = document.getElementById('opening');

  // Bước 1: hai cánh mở vào trong, lòng cổng sáng dần
  opening.classList.add('is-opening');

  document.body.style.overflow = 'auto';
  startCountdown();

  // Bước 2: khi cửa đã mở gần hết -> zoom vào lòng cổng, ánh sáng phủ kín màn
  setTimeout(() => {
    opening.classList.add('is-entering');
  }, 1000);

  // Bước 3: ánh chói đã phủ kín -> fade màn hình để lộ trang thiệp
  setTimeout(() => {
    opening.classList.add('hide');
    initReveal();
  }, 2550);

  setTimeout(() => {
    opening.style.display = 'none';
  }, 3600);
}
document.body.style.overflow = 'hidden';

/* ============ TƯƠNG TÁC: CHẠM CỔNG + PARALLAX CHUỘT ============ */
(function gateInteractions() {
  const gate = document.getElementById('gate3d');
  const opening = document.getElementById('opening');
  const scene = document.querySelector('.scene');
  if (!gate || !opening) return;

  // Chạm / click vào cổng để mở thiệp
  gate.addEventListener('click', () => { if (!isOpening) openCard(); });
  gate.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !isOpening) { e.preventDefault(); openCard(); }
  });

  // Parallax nhẹ: cảnh rừng + lá dịch theo chuột tạo chiều sâu
  let tx = 0, ty = 0, cx = 0, cy = 0;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && scene) {
    window.addEventListener('mousemove', (e) => {
      tx = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      ty = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    });
    window.addEventListener('mouseleave', () => { tx = 0; ty = 0; });
    // Dùng translate (không gây tính lại bố cục), bỏ qua khi chuột gần như đứng yên,
    // và dừng hẳn khi đã bấm mở để hiệu ứng chuyển cảnh chạy mượt.
    const ground = document.querySelector('.gate-ground');
    (function loop() {
      if (isOpening) return;
      const dx = (tx - cx) * 0.05, dy = (ty - cy) * 0.05;
      if (Math.abs(dx) > 0.0005 || Math.abs(dy) > 0.0005) {
        cx += dx; cy += dy;
        scene.style.transform = 'translate(' + (cx * -10).toFixed(2) + 'px,' + (cy * -8).toFixed(2) + 'px)';
        const g = (cx * 6).toFixed(2) + 'px 0';
        gate.style.translate = g;
        if (ground) ground.style.translate = g;
      }
      requestAnimationFrame(loop);
    })();
  }
})();

/* ============ HOA RƠI (bông hoa 4 cánh) ============ */
(function createPetals() {
  const wrap = document.getElementById('petals');
  // Bảng màu: cánh hoa + nhụy
  const petalsPalette = [
    { petal: '#95d5b2', center: '#f5e9c8' }, // xanh lá nhạt
    { petal: '#e8d48b', center: '#c9a227' }, // vàng kem
    { petal: '#ffffff', center: '#e8d48b' }, // trắng
    { petal: '#c9a227', center: '#fff6d8' }, // vàng đậm
    { petal: '#a7e0c0', center: '#f5e9c8' }, // xanh mint
    { petal: '#f5e9c8', center: '#c9a227' }, // kem
  ];
  const count = window.innerWidth < 640 ? 16 : 30;

  // SVG bông hoa 4 cánh: 4 ellipse xoay quanh tâm + nhụy tròn
  function flowerSVG(size, petal, center) {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 40 40" opacity="0.92">
        <g fill="${petal}" stroke="${center}" stroke-width="0.6">
          <ellipse cx="20" cy="9"  rx="6" ry="9"/>
          <ellipse cx="31" cy="20" rx="9" ry="6"/>
          <ellipse cx="20" cy="31" rx="6" ry="9"/>
          <ellipse cx="9"  cy="20" rx="9" ry="6"/>
        </g>
        <circle cx="20" cy="20" r="3.6" fill="${center}"/>
      </svg>`;
  }

  for (let i = 0; i < count; i++) {
    const petal = document.createElement('div');
    petal.className = 'petal';
    const size = 14 + Math.random() * 16;
    const dur = 9 + Math.random() * 9;
    const delay = Math.random() * -18;
    const drift = (Math.random() - 0.5) * 260;
    const spin = 360 + Math.random() * 1080;
    const c = petalsPalette[Math.floor(Math.random() * petalsPalette.length)];

    petal.style.left = Math.random() * 100 + '%';
    petal.style.animationDuration = dur + 's';
    petal.style.animationDelay = delay + 's';
    petal.style.setProperty('--drift', drift + 'px');
    petal.style.setProperty('--spin', spin + 'deg');
    petal.innerHTML = flowerSVG(size, c.petal, c.center);
    wrap.appendChild(petal);
  }
})();

/* ============ LÁ BAY + ĐOM ĐÓM TRONG RỪNG ============ */
(function createForest() {
  const opening = document.getElementById('opening');
  if (!opening) return;

  // Lá bay
  const leafWrap = opening.querySelector('.leaves');
  if (leafWrap) {
    const leafCount = window.innerWidth < 640 ? 10 : 20;
    for (let i = 0; i < leafCount; i++) {
      const leaf = document.createElement('div');
      leaf.className = 'leaf';
      const dur = 8 + Math.random() * 10;
      const delay = Math.random() * -18;
      const lx = (Math.random() - 0.5) * 320;
      const lr = 360 + Math.random() * 900;
      leaf.style.left = Math.random() * 100 + '%';
      leaf.style.width = leaf.style.height = (10 + Math.random() * 14) + 'px';
      leaf.style.animationDuration = dur + 's';
      leaf.style.animationDelay = delay + 's';
      leaf.style.setProperty('--lx', lx + 'px');
      leaf.style.setProperty('--lr', lr + 'deg');
      leaf.style.opacity = (0.4 + Math.random() * 0.4).toFixed(2);
      leafWrap.appendChild(leaf);
    }
  }

  // Đom đóm
  const ffWrap = opening.querySelector('.fireflies');
  if (ffWrap) {
    const ffCount = window.innerWidth < 640 ? 12 : 24;
    for (let i = 0; i < ffCount; i++) {
      const ff = document.createElement('div');
      ff.className = 'ff';
      ff.style.left = Math.random() * 100 + '%';
      ff.style.top = (20 + Math.random() * 75) + '%';
      ff.style.animationDuration = (3 + Math.random() * 4) + 's';
      ff.style.animationDelay = (Math.random() * 5) + 's';
      const sz = 3 + Math.random() * 4;
      ff.style.width = ff.style.height = sz + 'px';
      ffWrap.appendChild(ff);
    }
  }
})();

/* ============ NHẠC NỀN ============ */
const musicBtn = document.getElementById('musicBtn');
const bgMusic = document.getElementById('bgMusic');
let musicPlaying = false;

const MUSIC_VOLUME = 0.6;
let pausedByHide = false;

// Tăng/giảm âm lượng mượt trong `ms` mili-giây
function fadeVolume(to, ms, done) {
  const from = bgMusic.volume, start = performance.now();
  (function step(now) {
    const t = Math.min(1, (now - start) / ms);
    bgMusic.volume = from + (to - from) * t;
    if (t < 1) requestAnimationFrame(step); else if (done) done();
  })(start);
}

function setMusicUI(on) {
  musicPlaying = on;
  if (musicBtn) musicBtn.classList.toggle('paused', !on);
}

// Gọi ngay trong lúc bấm mở thiệp (cử chỉ của người dùng) nên trình duyệt cho phép phát.
// Vào gần như tức thì (tăng âm 0,3s chỉ để khỏi tiếng "bụp"); "musicStart" trong
// data/event.json = số giây muốn bỏ qua ở đầu bài.
function tryPlayMusic() {
  if (!bgMusic) return;
  const startAt = parseFloat(bgMusic.dataset.start) || 0;
  if (startAt && bgMusic.currentTime < startAt) {
    try { bgMusic.currentTime = startAt; } catch (e) {}
  }
  bgMusic.volume = 0.05;
  bgMusic.play().then(() => {
    setMusicUI(true);
    fadeVolume(MUSIC_VOLUME, 300);
  }).catch(() => setMusicUI(false));
}

// Khi chưa tải xong metadata thì chưa tua được -> tua lúc metadata sẵn sàng
if (bgMusic) {
  bgMusic.addEventListener('loadedmetadata', () => {
    const startAt = parseFloat(bgMusic.dataset.start) || 0;
    if (startAt && bgMusic.currentTime < startAt) bgMusic.currentTime = startAt;
  });
}

if (musicBtn && bgMusic) {
  musicBtn.addEventListener('click', () => {
    if (musicPlaying) {
      fadeVolume(0, 400, () => bgMusic.pause());
      setMusicUI(false);
    } else {
      bgMusic.play().then(() => fadeVolume(MUSIC_VOLUME, 800)).catch(() => {});
      setMusicUI(true);
    }
  });

  // Chuyển tab / khoá màn hình: tạm dừng, quay lại thì phát tiếp
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && musicPlaying) {
      pausedByHide = true;
      bgMusic.pause();
    } else if (!document.hidden && pausedByHide) {
      pausedByHide = false;
      bgMusic.play().catch(() => {});
    }
  });
}

/* ============ REVEAL KHI SCROLL ============ */
let revealInited = false;
function initReveal() {
  if (revealInited) return;
  revealInited = true;
  const items = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach((el) => io.observe(el));
}
window.addEventListener('scroll', () => {
  if (!revealInited) initReveal();
}, { once: true });

/* ============ ĐẾM NGƯỢC ============ */
let cdStarted = false;
function startCountdown() {
  if (cdStarted) return;
  cdStarted = true;
  const target = new Date(window.EVENT_DATE).getTime();
  const $d = document.getElementById('cdDays');
  const $h = document.getElementById('cdHours');
  const $m = document.getElementById('cdMinutes');
  const $s = document.getElementById('cdSeconds');
  const $msg = document.getElementById('cdMessage');
  const pad = (n) => String(n).padStart(2, '0');

  // Thẻ lật: nửa trên hiện số mới ngay, lá trên lật xuống che, lá dưới lật ra số mới
  function setFlip(el, val) {
    if (!el || el.dataset.v === val) return;
    const old = el.dataset.v || val;
    el.dataset.v = val;
    const [top, bottom, leafTop, leafBottom] = el.children;
    top.textContent = val;
    leafTop.textContent = old;
    bottom.textContent = old;
    leafBottom.textContent = val;
    el.classList.remove('flipping');
    void el.offsetWidth;            // khởi động lại animation
    el.classList.add('flipping');
    clearTimeout(el._t);
    el._t = setTimeout(() => { bottom.textContent = val; el.classList.remove('flipping'); }, 620);
  }

  function tick() {
    let diff = target - Date.now();

    if (diff <= 0) {
      [$d, $h, $m, $s].forEach((el) => setFlip(el, '00'));
      $msg.textContent = '✦ Chúc mừng — buổi lễ đã bắt đầu ✦';
      clearInterval(timer);
      return;
    }

    const days = Math.floor(diff / 86400000); diff -= days * 86400000;
    const hours = Math.floor(diff / 3600000); diff -= hours * 3600000;
    const mins = Math.floor(diff / 60000); diff -= mins * 60000;
    const secs = Math.floor(diff / 1000);

    setFlip($d, pad(days));
    setFlip($h, pad(hours));
    setFlip($m, pad(mins));
    setFlip($s, pad(secs));
  }

  tick();
  const timer = setInterval(tick, 1000);
}

/* ============ ALBUM ẢNH: COVERFLOW 3D + XEM TOÀN MÀN HÌNH ============ */
(function gallery() {
  const root = document.getElementById('gallerySlider');
  if (!root) return;
  const stage = root.querySelector('.cf-stage');
  const slides = Array.from(stage.querySelectorAll('.cf-slide'));
  const thumbsWrap = root.querySelector('.cf-thumbs');
  const ambient = root.querySelector('.cf-ambient');
  const bar = root.querySelector('.cf-progress');
  const playBtn = root.querySelector('.cf-play');
  const cur = root.querySelector('.car-cur');
  const n = slides.length;
  if (!n) { root.classList.remove('pre'); return; }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let active = 0;

  const srcOf = (i) => { const img = slides[i].querySelector('img'); return img ? (img.currentSrc || img.src) : ''; };

  // Ảnh thu nhỏ (dùng cho album và lightbox)
  function makeThumbs(wrap, onPick) {
    return slides.map((el, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cf-thumb';
      b.setAttribute('aria-label', 'Ảnh ' + (i + 1));
      const img = el.querySelector('img');
      if (img) { const t = new Image(); t.src = img.getAttribute('src'); t.alt = ''; t.loading = 'lazy'; b.appendChild(t); }
      else b.textContent = i + 1;
      b.addEventListener('click', () => onPick(i));
      wrap.appendChild(b);
      return b;
    });
  }
  function centerThumb(wrap, el) {
    wrap.scrollTo({ left: el.offsetLeft - wrap.clientWidth / 2 + el.offsetWidth / 2, behavior: 'smooth' });
  }
  const thumbs = makeThumbs(thumbsWrap, (i) => go(i));

  // Hạt kim tuyến
  const sparkWrap = root.querySelector('.cf-sparkles');
  if (sparkWrap && !reduce) {
    const count = window.innerWidth < 720 ? 10 : 20;
    for (let i = 0; i < count; i++) {
      const sp = document.createElement('span');
      sp.className = 'cf-spark';
      sp.style.left = (Math.random() * 100).toFixed(1) + '%';
      sp.style.setProperty('--sz', (3 + Math.random() * 5).toFixed(1) + 'px');
      sp.style.setProperty('--dur', (6 + Math.random() * 6).toFixed(1) + 's');
      sp.style.setProperty('--delay', (-Math.random() * 12).toFixed(1) + 's');
      sp.style.setProperty('--dx', ((Math.random() - 0.5) * 80).toFixed(0) + 'px');
      sparkWrap.appendChild(sp);
    }
  }

  const gapFactor = () => (window.innerWidth < 720 ? 0.34 : 0.5);
  function offset(i, pos) {
    let d = i - pos;
    if (n > 2) { if (d > n / 2) d -= n; if (d < -n / 2) d += n; }
    return d;
  }
  // Đặt vị trí 3D cho từng ảnh; pos có thể lẻ khi đang kéo
  function layout(pos) {
    const gap = slides[0].offsetWidth * gapFactor();
    const intro = root.classList.contains('intro');
    slides.forEach((el, i) => {
      const d = offset(i, pos), ad = Math.abs(d);
      const rot = -Math.sign(d) * Math.min(ad, 1) * 38;
      el.style.transform = 'translateX(calc(-50% + ' + (d * gap).toFixed(1) + 'px)) translateZ(' + (-ad * 170).toFixed(0) + 'px) rotateY(' + rot.toFixed(1) + 'deg)';
      el.style.opacity = ad > 2.4 ? 0 : 1;
      el.style.zIndex = 100 - Math.round(ad * 10);
      el.style.pointerEvents = ad > 2.4 ? 'none' : '';
      el.style.setProperty('--dim', Math.min(ad * 0.38, 0.75).toFixed(2));
      el.style.transitionDelay = intro ? (ad * 0.09).toFixed(2) + 's' : '';
    });
  }

  // Ảnh giữa nghiêng 3D theo chuột + vệt loá (chỉ máy có chuột)
  function resetTilt() {
    slides.forEach((el) => {
      const f = el.querySelector('.cf-frame');
      f.classList.remove('tilting');
      f.style.removeProperty('--rx');
      f.style.removeProperty('--ry');
    });
  }

  function go(i) {
    active = ((i % n) + n) % n;
    slides.forEach((el, k) => el.classList.toggle('active', k === active));
    thumbs.forEach((d, k) => d.classList.toggle('active', k === active));
    centerThumb(thumbsWrap, thumbs[active]);
    if (cur) cur.textContent = String(active + 1).padStart(2, '0');
    const src = srcOf(active);
    if (ambient) { ambient.style.backgroundImage = src ? 'url("' + src + '")' : ''; ambient.style.opacity = src ? '' : '0'; }
    resetTilt();
    layout(active);
    restartBar();
  }

  root.querySelector('.cf-btn.next').addEventListener('click', () => go(active + 1));
  root.querySelector('.cf-btn.prev').addEventListener('click', () => go(active - 1));
  stage.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1); }
    if (e.key === 'Enter') openLightbox(active);
  });

  // Kéo / vuốt: ảnh đi theo tay, thả ra thì về ảnh gần nhất
  let startX = null, moved = 0, downSlide = null;
  stage.addEventListener('pointerdown', (e) => {
    startX = e.clientX; moved = 0;
    downSlide = e.target.closest('.cf-slide');
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', (e) => {
    if (startX === null) return;
    moved = e.clientX - startX;
    if (Math.abs(moved) > 6) {
      stage.classList.add('dragging');
      resetTilt();
      layout(active - moved / (slides[0].offsetWidth * gapFactor()));
    }
  });
  stage.addEventListener('pointerup', () => {
    if (startX === null) return;
    const wasDrag = Math.abs(moved) > 6;
    stage.classList.remove('dragging');
    startX = null;
    if (wasDrag) { go(Math.round(active - moved / (slides[0].offsetWidth * gapFactor()))); return; }
    // bấm (không kéo): ảnh bên -> chuyển tới; ảnh giữa -> xem lớn
    if (!downSlide) return;
    const i = +downSlide.dataset.i;
    if (i === active) openLightbox(i); else go(i);
  });
  stage.addEventListener('pointercancel', () => { startX = null; stage.classList.remove('dragging'); layout(active); });

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer && !reduce) {
    stage.addEventListener('mousemove', (e) => {
      if (startX !== null) return;
      const f = slides[active].querySelector('.cf-frame');
      const r = f.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      if (x < 0 || x > 1 || y < 0 || y > 1) { if (f.classList.contains('tilting')) resetTilt(); return; }
      f.classList.add('tilting');
      f.style.setProperty('--ry', ((x - 0.5) * 12).toFixed(2) + 'deg');
      f.style.setProperty('--rx', ((0.5 - y) * 10).toFixed(2) + 'deg');
      f.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
      f.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
    });
    stage.addEventListener('mouseleave', resetTilt);
  }

  // Tự chạy: thanh vàng chạy 5 giây, hết thì sang ảnh tiếp
  let hovering = false, visible = false, lbOpen = false, userPaused = false;
  function syncPause() { root.classList.toggle('paused', hovering || !visible || lbOpen || userPaused); }
  function restartBar() {
    if (!bar || n < 2) return;
    bar.classList.remove('run');
    void bar.offsetWidth;
    bar.classList.add('run');
  }
  if (bar) bar.addEventListener('animationend', () => go(active + 1));
  if (playBtn) playBtn.addEventListener('click', () => {
    userPaused = !userPaused;
    playBtn.classList.toggle('off', userPaused);
    playBtn.setAttribute('aria-pressed', String(userPaused));
    playBtn.setAttribute('aria-label', userPaused ? 'Tiếp tục tự chuyển ảnh' : 'Tạm dừng tự chuyển ảnh');
    syncPause();
  });
  root.addEventListener('mouseenter', () => { hovering = true; syncPause(); });
  root.addEventListener('mouseleave', () => { hovering = false; syncPause(); });

  // Lần đầu cuộn tới: các ảnh bay ra từ phía sau, toả dần sang hai bên
  let introDone = false;
  new IntersectionObserver((es) => {
    visible = es[0].isIntersecting;
    syncPause();
    if (visible && !introDone) {
      introDone = true;
      root.classList.add('intro');
      layout(active);
      requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('pre')));
      setTimeout(() => { root.classList.remove('intro'); layout(active); }, 1700);
    }
  }, { threshold: 0.3 }).observe(root);
  window.addEventListener('resize', () => layout(active));

  /* ----- Xem ảnh toàn màn hình ----- */
  const lb = document.getElementById('lightbox');
  if (!lb) { go(0); return; }
  // Đưa ra thẳng <body> để nằm trên hoa rơi và nút nhạc
  document.body.appendChild(lb);
  const lbMedia = lb.querySelector('.lb-media');
  const lbCap = lb.querySelector('.lb-cap');
  const lbCount = lb.querySelector('.lb-count');
  const lbBg = lb.querySelector('.lb-bg');
  const lbBar = lb.querySelector('.lb-bar');
  const lbShow = lb.querySelector('.lb-slideshow');
  const lbFull = lb.querySelector('.lb-full');
  const lbThumbWrap = lb.querySelector('.lb-thumbs');
  const lbThumbs = makeThumbs(lbThumbWrap, (i) => showLb(i));
  let lbIndex = 0, slideshow = false;

  function showLb(i) {
    lbIndex = ((i % n) + n) % n;
    const fig = slides[lbIndex];
    const img = fig.querySelector('img');
    lbMedia.classList.remove('zoomed');
    lbMedia.innerHTML = '';
    if (img) {
      const big = new Image();
      big.src = img.currentSrc || img.src;
      big.alt = img.alt;
      big.draggable = false;
      lbMedia.appendChild(big);
    } else {
      lbMedia.appendChild(fig.querySelector('.gallery-ph').cloneNode(true));
    }
    const cap = fig.querySelector('figcaption');
    lbCap.textContent = cap ? cap.textContent : '';
    lbCount.textContent = String(lbIndex + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0');
    lbBg.style.backgroundImage = img ? 'url("' + (img.currentSrc || img.src) + '")' : '';
    lbThumbs.forEach((t, k) => t.classList.toggle('active', k === lbIndex));
    centerThumb(lbThumbWrap, lbThumbs[lbIndex]);
    if (slideshow) { lbBar.classList.remove('run'); void lbBar.offsetWidth; lbBar.classList.add('run'); }
  }
  function setSlideshow(on) {
    slideshow = on;
    lbShow.classList.toggle('on', on);
    lbShow.setAttribute('aria-pressed', String(on));
    lbBar.classList.remove('run');
    if (on) { void lbBar.offsetWidth; lbBar.classList.add('run'); }
  }
  lbBar.addEventListener('animationend', () => { if (slideshow) showLb(lbIndex + 1); });
  lbShow.addEventListener('click', () => setSlideshow(!slideshow));

  // Bấm ảnh để phóng to, rê chuột để soi chi tiết
  function zoomOrigin(e) {
    const img = lbMedia.querySelector('img');
    const r = lbMedia.getBoundingClientRect();
    img.style.transformOrigin = ((e.clientX - r.left) / r.width * 100) + '% ' + ((e.clientY - r.top) / r.height * 100) + '%';
  }
  lbMedia.addEventListener('click', (e) => {
    if (!lbMedia.querySelector('img')) return;
    zoomOrigin(e);
    lbMedia.classList.toggle('zoomed');
    if (lbMedia.classList.contains('zoomed')) setSlideshow(false);
  });
  lbMedia.addEventListener('mousemove', (e) => { if (lbMedia.classList.contains('zoomed')) zoomOrigin(e); });

  // Toàn màn hình thật (nếu trình duyệt hỗ trợ)
  if (!document.fullscreenEnabled) lbFull.style.display = 'none';
  lbFull.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else lb.requestFullscreen().catch(() => {});
  });

  function openLightbox(i) {
    showLb(i);
    lb.hidden = false;
    lbOpen = true;
    syncPause();
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => lb.classList.add('open'));
    lb.querySelector('.lb-close').focus();
  }
  function closeLightbox() {
    setSlideshow(false);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    lb.classList.remove('open');
    lbOpen = false;
    syncPause();
    document.body.style.overflow = 'auto';
    go(lbIndex);
    setTimeout(() => { lb.hidden = true; }, 350);
  }
  lb.querySelector('.lb-close').addEventListener('click', closeLightbox);
  lb.querySelector('.lb-btn.next').addEventListener('click', () => showLb(lbIndex + 1));
  lb.querySelector('.lb-btn.prev').addEventListener('click', () => showLb(lbIndex - 1));
  lb.addEventListener('click', (e) => { if (e.target === lb || e.target === lbBg) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lbOpen) return;
    if (e.key === 'Escape' && !document.fullscreenElement) closeLightbox();
    if (e.key === 'ArrowRight') showLb(lbIndex + 1);
    if (e.key === 'ArrowLeft') showLb(lbIndex - 1);
    if (e.key === ' ') { e.preventDefault(); setSlideshow(!slideshow); }
  });
  let lbX = null;
  lb.addEventListener('touchstart', (e) => { lbX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    if (lbX === null || lbMedia.classList.contains('zoomed')) { lbX = null; return; }
    const dx = e.changedTouches[0].clientX - lbX;
    if (Math.abs(dx) > 50) showLb(lbIndex + (dx < 0 ? 1 : -1));
    lbX = null;
  });

  go(0);
})();
