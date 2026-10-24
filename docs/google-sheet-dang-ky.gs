/**
 * Lưu đăng ký tham dự Lễ Tri Ân vào Google Sheet.
 * Cách cài: xem docs/HUONG-DAN-DANG-KY.md
 *
 * Mật khẩu (SECRET) đặt trong: Project Settings → Script Properties → thêm "SECRET".
 * Giá trị phải trùng với biến RSVP_SECRET trên Vercel.
 */
const SHEET_NAME = 'DangKy';
const HEADERS = ['Thời gian', 'Họ tên', 'Zalo', 'Facebook', 'Cập nhật lúc'];

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const secret = PropertiesService.getScriptProperties().getProperty('SECRET') || '';
    if (!secret || body.secret !== secret) return json({ ok: false, error: 'Sai SECRET' });

    const sheet = getSheet();
    if (body.action === 'upsert') return json(upsert(sheet, body.entry || {}));
    if (body.action === 'list') return json({ ok: true, rows: listRows(sheet) });
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
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#1b4332').setFontColor('#f5e9c8');
    sh.getRange('C:C').setNumberFormat('@'); // giữ số 0 đầu của số Zalo
  }
  return sh;
}

// Trùng số Zalo thì cập nhật dòng cũ, chưa có thì thêm dòng mới
function upsert(sh, en) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const zalo = String(en.zalo || '');
    const last = sh.getLastRow();
    if (last > 1) {
      const zalos = sh.getRange(2, 3, last - 1, 1).getDisplayValues();
      for (let i = 0; i < zalos.length; i++) {
        if (String(zalos[i][0]) === zalo) {
          sh.getRange(i + 2, 2, 1, 4).setValues([[en.name || '', zalo, en.facebook || '', new Date()]]);
          return { ok: true, updated: true };
        }
      }
    }
    sh.appendRow([new Date(en.time || Date.now()), en.name || '', zalo, en.facebook || '', '']);
    sh.getRange(sh.getLastRow(), 3).setNumberFormat('@').setValue(zalo);
    return { ok: true, updated: false };
  } finally {
    lock.releaseLock();
  }
}

function listRows(sh) {
  const last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, 5).getValues().map((r, i) => ({
    time: r[0] instanceof Date ? r[0].toISOString() : String(r[0]),
    name: String(r[1]),
    zalo: sh.getRange(i + 2, 3).getDisplayValue(),
    facebook: String(r[3]),
    updatedAt: r[4] instanceof Date ? r[4].toISOString() : ''
  }));
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
