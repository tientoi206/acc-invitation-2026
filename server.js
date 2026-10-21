const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/public', express.static(path.join(__dirname, 'public'), {
  maxAge: '7d'
}));

app.get('/', (req, res) => {
  const data = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data', 'event.json'), 'utf-8')
  );
  res.render('index', { data });
});

app.listen(PORT, () => {
  console.log(`✦ Thiệp mời ACC 2026 đang chạy: http://localhost:${PORT}`);
});

module.exports = app;
