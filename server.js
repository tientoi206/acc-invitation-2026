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

app.get('/', (req, res) => {
  const data = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data', 'event.json'), 'utf-8')
  );
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.render('index', {
    data,
    musicSrc: musicSource(data),
    cssVersion: assetVersion('public/css/style.css'),
    jsVersion: assetVersion('public/js/main.js')
  });
});

// Chỉ listen khi chạy local. Trên Vercel, serverless tự handle.
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`✦ Thiệp mời ACC 2026 đang chạy: http://localhost:${PORT}`);
  });
}

module.exports = app;
