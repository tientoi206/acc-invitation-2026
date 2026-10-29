/**
 * Lưu đăng ký tham dự Lễ Tri Ân vào Google Sheet.
 * Cách cài: xem docs/HUONG-DAN-DANG-KY.md
 *
 * Mật khẩu (SECRET) đặt trong: Project Settings → Script Properties → thêm "SECRET".
 * Giá trị phải trùng với biến RSVP_SECRET trên Vercel.
 *
 * Cột được ghi theo TÊN tiêu đề, thiếu cột nào script tự thêm vào cuối,
 * nên dùng được cả với Sheet tạo từ bản script cũ.
 */
const SHEET_NAME = 'DangKy';
const COLS = [
  { key: 'time', title: 'Thời gian' },
  { key: 'name', title: 'Họ tên' },
  { key: 'gender', title: 'Giới tính' },
  { key: 'zalo', title: 'Zalo' },
  { key: 'facebook', title: 'Facebook' },
  { key: 'khoa', title: 'Sinh hoạt / BĐD khóa' },
  { key: 'updatedAt', title: 'Cập nhật lúc' }
];

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const secret = PropertiesService.getScriptProperties().getProperty('SECRET') || '';
    if (!secret || body.secret !== secret) return json({ ok: false, error: 'Sai SECRET' });

    const sheet = getSheet();
    const col = ensureHeaders(sheet);
    if (body.action === 'upsert') return json(upsert(sheet, col, body.entry || {}));
    if (body.action === 'list') return json({ ok: true, rows: listRows(sheet, col) });
    return json({ ok: false, error: 'Không rõ yêu cầu' });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.setFrozenRows(1);
  }
  return sh;
}

// Trả về { key: số cột (1-based) }; thêm tiêu đề còn thiếu vào cuối hàng 1
function ensureHeaders(sh) {
  const lastCol = Math.max(sh.getLastColumn(), 1);
  const head = sh.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
  const col = {};
  let next = head.filter(String).length + 1;
  COLS.forEach((c) => {
    let i = head.indexOf(c.title);
    if (i < 0) {
      sh.getRange(1, next).setValue(c.title);
      i = next - 1;
      next++;
    }
    col[c.key] = i + 1;
  });
  const hdr = sh.getRange(1, 1, 1, next - 1);
  hdr.setFontWeight('bold').setBackground('#1b4332').setFontColor('#f5e9c8');
  sh.getRange(1, col.zalo, sh.getMaxRows(), 1).setNumberFormat('@'); // giữ số 0 đầu của số Zalo
  return col;
}

// Trùng số Zalo thì cập nhật dòng cũ, chưa có thì thêm dòng mới
function upsert(sh, col, en) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const zalo = String(en.zalo || '');
    const width = Math.max.apply(null, Object.keys(col).map((k) => col[k]));
    const last = sh.getLastRow();
    let row = 0;
    if (last > 1) {
      const zalos = sh.getRange(2, col.zalo, last - 1, 1).getDisplayValues();
      for (let i = 0; i < zalos.length; i++) {
        if (String(zalos[i][0]) === zalo) { row = i + 2; break; }
      }
    }
    const updated = row > 0;
    if (!updated) row = last + 1;
    const values = updated ? sh.getRange(row, 1, 1, width).getValues()[0] : new Array(width).fill('');
    const set = (k, v) => { values[col[k] - 1] = v; };
    if (!updated) set('time', new Date(en.time || Date.now()));
    set('name', en.name || '');
    set('gender', en.gender || '');
    set('zalo', zalo);
    set('facebook', en.facebook || '');
    set('khoa', en.khoa || '');
    if (updated) set('updatedAt', new Date());
    sh.getRange(row, col.zalo).setNumberFormat('@');
    sh.getRange(row, 1, 1, width).setValues([values]);
    return { ok: true, updated: updated };
  } finally {
    lock.releaseLock();
  }
}

function listRows(sh, col) {
  const last = sh.getLastRow();
  if (last < 2) return [];
  const width = sh.getLastColumn();
  const vals = sh.getRange(2, 1, last - 1, width).getValues();
  const disp = sh.getRange(2, 1, last - 1, width).getDisplayValues();
  const iso = (v) => (v instanceof Date ? v.toISOString() : String(v || ''));
  return vals.map((r, i) => ({
    time: iso(r[col.time - 1]),
    name: String(r[col.name - 1] || ''),
    gender: String(r[col.gender - 1] || ''),
    zalo: disp[i][col.zalo - 1],
    facebook: String(r[col.facebook - 1] || ''),
    khoa: String(r[col.khoa - 1] || ''),
    updatedAt: iso(r[col.updatedAt - 1])
  })).filter((r) => r.name || r.zalo);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
