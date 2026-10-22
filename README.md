# Thiệp mời — Lễ Tri Ân ACC 2026

Thiệp mời online single-page của **Sinh Viên Công Giáo Thánh Linh**, chạy Node.js (Express + EJS), deploy trên Vercel.

## Cấu trúc

```
.
├── package.json
├── vercel.json
├── server.js
├── data/event.json          ← chỉnh toàn bộ nội dung ở đây
├── views/index.ejs
└── public/
    ├── css/style.css
    ├── js/main.js
    ├── music/               ← thả nhạc nền vào đây
    └── images/gallery/      ← thả ảnh thư viện vào đây
```

## Chạy local

```bash
npm install
npm start
# mở http://localhost:3000
```

## Deploy Vercel

```bash
npm i -g vercel
vercel
```

Hoặc import repo GitHub vào dashboard Vercel (Framework: Other).

## Checklist hoàn thiện

| Việc | Cách làm |
|---|---|
| Nhạc nền | Thả 1 file `.mp3` vào `public/music/` là xong — server tự nhận (nếu có nhiều file thì lấy file đầu tiên theo tên). Nhạc phát khi bấm mở cổng, lặp suốt lúc xem thiệp. Muốn chỉ định cụ thể thì set `"musicFile"` trong `data/event.json` |
| Ảnh thư viện | Thả ảnh vào `public/images/gallery/`, set `"image": "/public/images/gallery/1.jpg"` trong mảng `gallery` |
| Link bản đồ | Cập nhật `"mapUrl"`, `"mapAddress"` trong `data/event.json` |
| Ngày giờ | Cập nhật `"date"` (ISO, giờ VN `+07:00`) và `"dateDisplay"` |
