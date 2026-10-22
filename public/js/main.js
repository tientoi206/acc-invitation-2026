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

  function tick() {
    const now = Date.now();
    let diff = target - now;

    if (diff <= 0) {
      $d.textContent = '00'; $h.textContent = '00';
      $m.textContent = '00'; $s.textContent = '00';
      $msg.textContent = '✦ Chúc mừng — buổi lễ đã bắt đầu ✦';
      clearInterval(timer);
      return;
    }

    const days = Math.floor(diff / 86400000); diff -= days * 86400000;
    const hours = Math.floor(diff / 3600000); diff -= hours * 3600000;
    const mins = Math.floor(diff / 60000); diff -= mins * 60000;
    const secs = Math.floor(diff / 1000);

    $d.textContent = pad(days);
    $h.textContent = pad(hours);
    $m.textContent = pad(mins);
    $s.textContent = pad(secs);

    $s.classList.add('tick');
    setTimeout(() => $s.classList.remove('tick'), 300);
  }

  tick();
  const timer = setInterval(tick, 1000);
}
