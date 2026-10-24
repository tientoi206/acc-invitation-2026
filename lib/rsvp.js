// Lưu danh sách đăng ký tham dự.
// - Có biến môi trường RSVP_SHEET_URL (link Web App của Google Apps Script) -> lưu vào Google Sheet.
// - Chạy trên máy (không phải Vercel) -> lưu vào data/rsvp.json.
// - Trên Vercel mà chưa cấu hình Google Sheet -> báo chưa sẵn sàng (Vercel không giữ được file).
const fs = require('fs');
const path = require('path');

const SHEET_URL = process.env.RSVP_SHEET_URL || '';
const SHEET_SECRET = process.env.RSVP_SECRET || '';
const ON_VERCEL = process.env.VERCEL === '1';
const LOCAL_FILE = path.join(__dirname, '..', 'data', 'rsvp.json');

function mode() {
  if (SHEET_URL) return 'sheet';
  if (!ON_VERCEL) return 'file';
  return 'none';
}

// ---------- Kiểm tra dữ liệu khách nhập ----------
const clean = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

function validate(body) {
  const name = clean(body.name, 80);
  const zaloRaw = clean(body.zalo, 30);
  let facebook = clean(body.facebook, 200);
  const errors = {};

  if (name.length < 2) errors.name = 'Vui lòng nhập họ tên.';

  // Số Zalo: bỏ khoảng trắng/dấu chấm/gạch; nhận 0xxxxxxxxx hoặc +84xxxxxxxxx
  let zalo = zaloRaw.replace(/[\s.\-()]/g, '');
  if (/^\+?84\d{9}$/.test(zalo)) zalo = '0' + zalo.replace(/^\+?84/, '');
  if (!/^0\d{9}$/.test(zalo)) errors.zalo = 'Số Zalo chưa đúng (10 số, bắt đầu bằng 0).';

  if (facebook) {
    if (!/^https?:\/\//i.test(facebook)) facebook = 'https://' + facebook.replace(/^\/+/, '');
    let ok = false;
    try {
      const u = new URL(facebook);
      ok = /(^|\.)(facebook\.com|fb\.com|fb\.me|m\.me)$/i.test(u.hostname);
    } catch (e) {}
    if (!ok) errors.facebook = 'Link Facebook chưa đúng (ví dụ: facebook.com/ten-cua-ban).';
  }

  return { ok: !Object.keys(errors).length, errors, entry: { name, zalo, facebook } };
}

// ---------- Lưu file trên máy ----------
function readLocal() {
  try { return JSON.parse(fs.readFileSync(LOCAL_FILE, 'utf8')); } catch (e) { return []; }
}
function writeLocal(list) {
  const tmp = LOCAL_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(list, null, 2));
  fs.renameSync(tmp, LOCAL_FILE);
}

// ---------- Google Sheet (Apps Script Web App) ----------
async function sheetCall(payload) {
  const res = await fetch(SHEET_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(Object.assign({ secret: SHEET_SECRET }, payload)),
    redirect: 'follow'
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch (e) { throw new Error('Google Sheet trả về dữ liệu lạ: ' + text.slice(0, 120)); }
  if (!json.ok) throw new Error(json.error || 'Google Sheet báo lỗi');
  return json;
}

// Thêm mới; trùng số Zalo thì cập nhật dòng cũ (khách sửa lại thông tin)
async function save(entry) {
  const now = new Date().toISOString();
  const m = mode();
  if (m === 'sheet') {
    const r = await sheetCall({ action: 'upsert', entry: Object.assign({ time: now }, entry) });
    return { updated: !!r.updated };
  }
  if (m === 'file') {
    const list = readLocal();
    const i = list.findIndex((x) => x.zalo === entry.zalo);
    if (i >= 0) {
      list[i] = Object.assign({}, list[i], entry, { updatedAt: now });
      writeLocal(list);
      return { updated: true };
    }
    list.push(Object.assign({ time: now }, entry));
    writeLocal(list);
    return { updated: false };
  }
  throw Object.assign(new Error('Chưa cấu hình nơi lưu đăng ký'), { code: 'NO_STORAGE' });
}

async function list() {
  const m = mode();
  if (m === 'sheet') return (await sheetCall({ action: 'list' })).rows || [];
  if (m === 'file') return readLocal();
  return [];
}

module.exports = { mode, validate, save, list };
