const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files.
// HTML luôn được kiểm tra lại (no-cache) để bản mới hiện ngay;
// file tĩnh có cache ngắn + etag, và link CSS/JS được gắn ?v= theo mtime.
app.use('/public', express.static(path.join(__dirname, 'public'), {
  maxAge: '1h',
  etag: true,
  lastModified: true,
  setHeaders: (res) => {
    // CSS/JS đổi thường xuyên -> trình duyệt luôn revalidate
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  },
  fallthrough: true
}));

// Lấy version = hash nội dung file (md5) để chống cache khi deploy.
// Dùng hash (không phải mtime) vì trên Vercel mtime file không đổi theo commit.
const crypto = require('crypto');
function assetVersion(relPath) {
  try {
    const buf = fs.readFileSync(path.join(__dirname, relPath));
    return crypto.createHash('md5').update(buf).digest('hex').slice(0, 8);
  } catch (e) {
    return Date.now().toString(36);
  }
}

// Nhạc nền: ưu tiên "musicFile" trong data/event.json; nếu để trống thì tự lấy
// file nhạc đầu tiên (theo tên) trong public/music/. Gắn ?v= theo dung lượng file
// để khi thay bài khác, trình duyệt tải bài mới.
// Nhận cả file video .mp4/.webm (trình duyệt phát phần tiếng). Có nhiều file thì ưu tiên
// file nhạc thuần (mp3, m4a...) trước, cùng loại thì theo tên.
const MUSIC_EXT = ['mp3', 'm4a', 'aac', 'ogg', 'wav', 'mp4', 'webm'];
const extRank = (f) => MUSIC_EXT.indexOf(path.extname(f).slice(1).toLowerCase());
function musicSource(data) {
  try {
    if (data.features && data.features.musicFile) return data.features.musicFile;
    const dir = path.join(__dirname, 'public', 'music');
    const file = fs.readdirSync(dir)
      .filter((f) => extRank(f) >= 0)
      .sort((a, b) => extRank(a) - extRank(b) || a.localeCompare(b))[0];
    if (!file) return '';
    const size = fs.statSync(path.join(dir, file)).size;
    return '/public/music/' + encodeURIComponent(file) + '?v=' + size.toString(36);
  } catch (e) {
    return '';
  }
}

// Favicon: thả 1 ảnh tên "favicon.*" (png/jpg/svg/ico/webp) vào public/images/ là tự nhận
const ICON_TYPES = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', svg: 'image/svg+xml', ico: 'image/x-icon', webp: 'image/webp' };
function faviconInfo() {
  try {
    const dir = path.join(__dirname, 'public', 'images');
    const file = fs.readdirSync(dir).find((f) => /^favicon\.(png|jpe?g|svg|ico|webp)$/i.test(f));
    if (!file) return null;
    const ext = path.extname(file).slice(1).toLowerCase();
    const size = fs.statSync(path.join(dir, file)).size;
    return { href: '/public/images/' + file + '?v=' + size.toString(36), type: ICON_TYPES[ext] };
  } catch (e) {
    return null;
  }
}

// Album: nếu data/event.json chưa gắn ảnh nào thì tự lấy ảnh trong public/images/gallery/
// và public/images/ (bỏ qua favicon), xếp theo tên, tối đa "galleryMax" ảnh (mặc định 9).
// Không có ảnh thì giữ ô trống mẫu.
const PHOTO_EXT = /\.(jpe?g|png|webp|avif|gif)$/i;
function galleryItems(data) {
  const list = Array.isArray(data.gallery) ? data.gallery : [];
  if (list.some((g) => g.image)) return list.filter((g) => g.image);
  const max = Number(data.galleryMax) || 9;
  const found = [];
  for (const sub of ['gallery', '']) {
    try {
      const dir = path.join(__dirname, 'public', 'images', sub);
      fs.readdirSync(dir)
        .filter((f) => PHOTO_EXT.test(f) && !/^favicon\./i.test(f))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .forEach((f) => found.push({ image: '/public/images/' + (sub ? sub + '/' : '') + encodeURIComponent(f), caption: '' }));
    } catch (e) {}
  }
  return found.length ? found.slice(0, max) : list;
}

// Trình duyệt hay tự gọi /favicon.ico -> chuyển sang ảnh favicon nếu có
app.get('/favicon.ico', (req, res) => {
  const icon = faviconInfo();
  if (icon) res.redirect(302, icon.href);
  else res.status(204).end();
});

app.get('/', (req, res) => {
  const data = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data', 'event.json'), 'utf-8')
  );
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.render('index', {
    data,
    gallery: galleryItems(data),
    musicSrc: musicSource(data),
    favicon: faviconInfo(),
    cssVersion: assetVersion('public/css/style.css'),
    jsVersion: assetVersion('public/js/main.js')
  });
});

/* ============ ĐĂNG KÝ THAM DỰ ============ */
const rsvp = require('./lib/rsvp');
app.use('/api', express.json({ limit: '10kb' }));

// Chống gửi dồn: mỗi IP tối đa 8 lần / 10 phút
const hits = new Map();
function tooMany(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 600000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 8;
}

app.post('/api/rsvp', async (req, res) => {
  const body = req.body || {};
  // ô "website" ẩn: người thật không thấy để điền, bot tự điền thì bỏ qua
  if (body.website) return res.json({ ok: true });
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  if (tooMany(ip)) return res.status(429).json({ ok: false, message: 'Bạn gửi hơi nhiều lần, vui lòng thử lại sau ít phút.' });

  const v = rsvp.validate(body);
  if (!v.ok) return res.status(400).json({ ok: false, errors: v.errors, message: 'Vui lòng kiểm tra lại thông tin.' });
  try {
    const r = await rsvp.save(v.entry);
    res.json({ ok: true, updated: r.updated, name: v.entry.name });
  } catch (e) {
    console.error('RSVP save failed:', e.message);
    const msg = e.code === 'NO_STORAGE'
      ? 'Mục đăng ký đang được thiết lập, bạn vui lòng quay lại sau nhé.'
      : 'Chưa gửi được, bạn thử lại giúp mình nhé.';
    res.status(503).json({ ok: false, message: msg });
  }
});

// Trang xem danh sách: /quan-ly?key=MAT_KHAU
// Mật khẩu lấy từ biến môi trường ADMIN_KEY; chạy trên máy mà chưa đặt thì mặc định "leacc".
const ADMIN_KEY = process.env.ADMIN_KEY || (process.env.VERCEL === '1' ? '' : 'leacc');
function checkKey(req, res) {
  const key = String(req.query.key || '');
  if (!ADMIN_KEY || key !== ADMIN_KEY) {
    res.status(401).set('Cache-Control', 'no-store').render('admin', { rows: null, error: key ? 'Sai mật khẩu.' : '', key: '', mode: rsvp.mode() });
    return false;
  }
  return true;
}
app.get('/quan-ly', async (req, res) => {
  if (!checkKey(req, res)) return;
  res.set('Cache-Control', 'no-store');
  try {
    const rows = (await rsvp.list()).slice().reverse();
    res.render('admin', { rows, error: '', key: req.query.key, mode: rsvp.mode() });
  } catch (e) {
    res.render('admin', { rows: [], error: 'Không đọc được danh sách: ' + e.message, key: req.query.key, mode: rsvp.mode() });
  }
});
app.get('/quan-ly/danh-sach.csv', async (req, res) => {
  if (!checkKey(req, res)) return;
  const rows = await rsvp.list();
  const esc = (s) => '"' + String(s == null ? '' : s).replace(/"/g, '""') + '"';
  const csv = ['Thời gian,Họ tên,Giới tính,Zalo,Facebook,Sinh hoạt / BĐD khóa']
    .concat(rows.map((r) => [new Date(r.time).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }), r.name, r.gender || '', "'" + r.zalo, r.facebook, r.khoa || ''].map(esc).join(',')))
    .join('\r\n');
  res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="dang-ky-le-tri-an.csv"', 'Cache-Control': 'no-store' });
  res.send('﻿' + csv); // BOM để Excel đọc đúng tiếng Việt
});

// Chỉ listen khi chạy local. Trên Vercel, serverless tự handle.
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`✦ Thiệp mời ACC 2026 đang chạy: http://localhost:${PORT}`);
  });
}

module.exports = app;
