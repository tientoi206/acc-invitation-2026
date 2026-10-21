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

app.get('/', (req, res) => {
  const data = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data', 'event.json'), 'utf-8')
  );
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.render('index', {
    data,
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
