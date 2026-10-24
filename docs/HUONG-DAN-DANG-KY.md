# Hướng dẫn mục Đăng ký tham dự

Khách vào thiệp, kéo tới mục **Đăng ký tham dự**, điền *Họ tên – Số Zalo – Link Facebook* rồi bấm gửi.
Cùng một số Zalo gửi lại thì sẽ **cập nhật** thông tin cũ, không bị trùng.

## Xem danh sách

Mở: `https://<link-thiệp>/quan-ly` → nhập mật khẩu quản lý.

- Có ô tìm kiếm, bấm số Zalo để mở chat Zalo, nút **Tải file Excel (CSV)**.
- Chạy trên máy: mật khẩu mặc định là `leacc` → http://localhost:3000/quan-ly?key=leacc
  (dữ liệu lưu ở `data/rsvp.json`, file này không đưa lên GitHub).

## Cài đặt cho bản trên Vercel (làm 1 lần, ~5 phút)

Vercel không giữ được file lâu dài, nên bản online lưu vào **Google Sheet** của bạn.

### 1. Tạo Google Sheet + script
1. Vào https://sheets.new tạo một Sheet mới, đặt tên ví dụ *Đăng ký Lễ Tri Ân*.
2. Menu **Tiện ích mở rộng → Apps Script**.
3. Xoá hết code mẫu, dán toàn bộ nội dung file `docs/google-sheet-dang-ky.gs`, bấm 💾 Lưu.
4. Bánh răng **Project Settings** (bên trái) → kéo xuống **Script Properties** → **Add script property**:
   - Property: `SECRET`
   - Value: một chuỗi bí mật tự đặt, ví dụ `acc2026-bi-mat-123` → **Save**.

### 2. Xuất bản thành Web App
1. Nút **Deploy → New deployment** → biểu tượng bánh răng → chọn **Web app**.
2. *Execute as*: **Me** · *Who has access*: **Anyone** → **Deploy**.
3. Google hỏi quyền → chọn tài khoản → *Advanced* → *Go to … (unsafe)* → **Allow**
   (đây là script của chính bạn nên an toàn).
4. Copy **Web app URL** (dạng `https://script.google.com/macros/s/…/exec`).

### 3. Khai báo trên Vercel
Vercel → project thiệp → **Settings → Environment Variables**, thêm 3 biến:

| Name | Value |
|---|---|
| `RSVP_SHEET_URL` | Web app URL vừa copy |
| `RSVP_SECRET` | đúng chuỗi `SECRET` ở bước 1.4 |
| `ADMIN_KEY` | mật khẩu để mở trang `/quan-ly` |

Sau đó vào **Deployments → bản mới nhất → ⋯ → Redeploy**.

Xong! Mỗi lượt đăng ký sẽ hiện ngay trong Google Sheet, và cả ở trang `/quan-ly`.

> Nếu sau này sửa code script, nhớ **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**
> để giữ nguyên link Web App.
