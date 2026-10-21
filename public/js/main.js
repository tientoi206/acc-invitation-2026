/* ============ MỞ THIỆP (CỔNG RỪNG) ============ */
let isOpening = false;
function openCard() {
  if (isOpening) return;
  isOpening = true;

  const opening = document.getElementById('opening');

  // 1) Mở hai cánh cổng + nội dung bay đi
  opening.classList.add('is-opening');

  // 2) Nhạc + countdown + scroll
  tryPlayMusic();
  document.body.style.overflow = 'auto';
  startCountdown();

  // 3) Fade & ẩn toàn màn hình
  setTimeout(() => {
    opening.classList.add('hide');
    initReveal();
  }, 1200);

  setTimeout(() => {
    opening.style.display = 'none';
  }, 2300);
}
document.body.style.overflow = 'hidden';

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

function tryPlayMusic() {
  if (!bgMusic || !bgMusic.querySelector('source')) return;
  bgMusic.play().then(() => {
    musicPlaying = true;
    musicBtn.classList.remove('paused');
  }).catch(() => {
    musicPlaying = false;
    musicBtn.classList.add('paused');
  });
}

musicBtn.addEventListener('click', () => {
  if (!bgMusic || !bgMusic.querySelector('source')) {
    musicBtn.animate(
      [{ transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }],
      { duration: 260 }
    );
    return;
  }
  if (musicPlaying) {
    bgMusic.pause();
    musicBtn.classList.add('paused');
  } else {
    bgMusic.play();
    musicBtn.classList.remove('paused');
  }
  musicPlaying = !musicPlaying;
});

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
