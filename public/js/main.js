/* ============ MỞ THIỆP (CỬA HOA) ============ */
let isOpening = false;
function openCard() {
  if (isOpening) return;
  isOpening = true;

  const opening = document.getElementById('opening');
  const opFrame = document.getElementById('opFrame');

  // 1) Ẩn nội dung thiệp + mở hai cánh cửa
  opening.classList.add('is-opening');
  if (opFrame) opFrame.style.pointerEvents = 'none';

  // 2) Bắt đầu nhạc + countdown + reveal song song
  tryPlayMusic();
  document.body.style.overflow = 'auto';
  startCountdown();

  // 3) Sau khi cửa mở xong -> fade cả màn hình rồi ẩn hẳn
  setTimeout(() => {
    opening.classList.add('hide');
    initReveal();
  }, 1100);

  setTimeout(() => {
    opening.style.display = 'none';
  }, 2200);
}
document.body.style.overflow = 'hidden';

/* ============ HOA RƠI ============ */
(function createPetals() {
  const wrap = document.getElementById('petals');
  const colors = ['#e8d48b', '#c9a227', '#95d5b2', '#ffffff', '#d9bf6a'];
  const count = window.innerWidth < 640 ? 14 : 26;

  for (let i = 0; i < count; i++) {
    const petal = document.createElement('div');
    petal.className = 'petal';
    const size = 10 + Math.random() * 14;
    const dur = 8 + Math.random() * 8;
    const delay = Math.random() * -15;
    const drift = (Math.random() - 0.5) * 220;
    const spin = 360 + Math.random() * 720;
    const color = colors[Math.floor(Math.random() * colors.length)];

    petal.style.left = Math.random() * 100 + '%';
    petal.style.animationDuration = dur + 's';
    petal.style.animationDelay = delay + 's';
    petal.style.setProperty('--drift', drift + 'px');
    petal.style.setProperty('--spin', spin + 'deg');
    petal.innerHTML = `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" opacity="0.9">
        <path d="M12 2c2 3 4 5 4 8a4 4 0 0 1-8 0c0-3 2-5 4-8z"/>
        <path d="M12 22c-1.5-2-3-3.5-3-5.5a3 3 0 0 1 6 0c0 2-1.5 3.5-3 5.5z" opacity="0.6"/>
      </svg>`;
    wrap.appendChild(petal);
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
