/********************
 * Config Ruta Laboral Minera
 ********************/
const SYNC_BASE_URL = "https://TU-DOMINIO-DE-RUTA-LABORAL.vercel.app";
const SYNC_SECRET = "PEGA_AQUI_EL_MISMO_SYNC_SECRET_DE_VERCEL";
const SHEET_ALUMNOS = "ALUMNOS";
const SHEET_EMPLEOS = "EMPLEOS";

const COOLDOWN_SECONDS = 2;
const QUEUE_FLUSH_DELAY_MS = 800;

/********************
 * Setup
 * Ejecuta setup() una sola vez manualmente.
 ********************/
function setup() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach((t) => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger("onEditInstalled")
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onEdit()
    .create();

  Logger.log("Trigger instalable creado: onEditInstalled");
}

/********************
 * Utils
 ********************/
function postJson(path, payload) {
  const base = SYNC_BASE_URL.replace(/\/$/, "");
  const url = base + path;

  const res = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    muteHttpExceptions: true,
    headers: { "x-sync-secret": SYNC_SECRET },
    payload: JSON.stringify(payload),
  });

  const code = res.getResponseCode();
  const text = res.getContentText();

  Logger.log("POST " + url + " -> " + code);
  Logger.log(text);

  if (code < 200 || code >= 300) {
    throw new Error("Sync error " + code + ": " + text);
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    return { raw: text };
  }
}

function getHeaderMap_(sh) {
  const lastCol = sh.getLastColumn();
  const headers = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  const map = {};

  for (let c = 0; c < headers.length; c++) {
    const key = String(headers[c] || "").trim();
    if (key) map[key] = c + 1;
  }

  return map;
}

function getRowObject_(sh, rowIndex) {
  const headerMap = getHeaderMap_(sh);
  const lastCol = sh.getLastColumn();
  const values = sh.getRange(rowIndex, 1, 1, lastCol).getValues()[0];
  const obj = {};

  Object.keys(headerMap).forEach((header) => {
    const col = headerMap[header];
    const val = values[col - 1];

    if (val instanceof Date) {
      obj[header] = Utilities.formatDate(
        val,
        Session.getScriptTimeZone(),
        "yyyy-MM-dd"
      );
    } else if (val !== "" && val != null) {
      obj[header] = String(val).trim();
    } else {
      obj[header] = "";
    }
  });

  return obj;
}

function findHeaderColCI_(sh, headerName) {
  const lastCol = sh.getLastColumn();
  if (lastCol < 1) return null;

  const headers = sh.getRange(1, 1, 1, lastCol).getValues()[0];
  const target = String(headerName).trim().toLowerCase();

  for (let i = 0; i < headers.length; i++) {
    if (String(headers[i] || "").trim().toLowerCase() === target) return i + 1;
  }

  return null;
}

function stampAsesoraForEdit_(e) {
  if (!e || !e.range) return;

  const sh = e.range.getSheet();
  const name = sh.getName();
  if (name !== SHEET_ALUMNOS && name !== SHEET_EMPLEOS) return;

  const asesoraCol = findHeaderColCI_(sh, "asesora");
  if (!asesoraCol) return;
  if (e.range.getColumn() === asesoraCol) return;

  const email = Session.getActiveUser().getEmail();
  if (!email) return;

  const startRow = e.range.getRow();
  const numRows = e.range.getNumRows();
  const rows = [];

  for (let i = 0; i < numRows; i++) {
    const r = startRow + i;
    if (r > 1) rows.push(r);
  }

  if (rows.length === 0) return;

  const values = rows.map(() => [email]);
  sh.getRange(rows[0], asesoraCol, rows.length, 1).setValues(values);
}

/********************
 * Sync full sheet manual
 ********************/
function readSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(sheetName);
  if (!sh) throw new Error("No existe hoja: " + sheetName);

  const values = sh.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map((h) => String(h).trim());
  const rows = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const obj = {};
    let hasAny = false;

    for (let c = 0; c < headers.length; c++) {
      const key = headers[c];
      if (!key) continue;

      const val = row[c];
      if (val instanceof Date) {
        obj[key] = Utilities.formatDate(
          val,
          Session.getScriptTimeZone(),
          "yyyy-MM-dd"
        );
        hasAny = true;
      } else if (val !== "" && val != null) {
        obj[key] = String(val).trim();
        hasAny = true;
      } else {
        obj[key] = "";
      }
    }

    if (hasAny) rows.push(obj);
  }

  return rows;
}

function syncAlumnos() {
  const rows = readSheet(SHEET_ALUMNOS);
  postJson("/api/sync/alumnos", { rows, fullSync: true });
}

function syncEmpleos() {
  const rows = readSheet(SHEET_EMPLEOS);
  postJson("/api/sync/empleos", { rows, fullSync: true });
}

function syncTodo() {
  syncAlumnos();
  syncEmpleos();
}

/********************
 * Queue + flush automatico
 ********************/
function queueRows_(sheetName, rowIndexes) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);

  try {
    const props = PropertiesService.getScriptProperties();
    const qKey = "queue_" + sheetName;
    const current = String(props.getProperty(qKey) || "").trim();
    const set = new Set(current ? current.split(",").map((x) => Number(x)) : []);

    rowIndexes.forEach((r) => {
      if (r > 1) set.add(r);
    });

    props.setProperty(qKey, Array.from(set).sort((a, b) => a - b).join(","));
    scheduleFlush_();
  } finally {
    lock.releaseLock();
  }
}

function scheduleFlush_() {
  const props = PropertiesService.getScriptProperties();
  const key = "flush_scheduled_at";
  const scheduledAt = Number(props.getProperty(key) || "0");
  const now = Date.now();

  if (scheduledAt && now - scheduledAt < QUEUE_FLUSH_DELAY_MS) return;

  props.setProperty(key, String(now));
  ScriptApp.newTrigger("flushQueues").timeBased().after(QUEUE_FLUSH_DELAY_MS).create();
}

function flushQueues() {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);

  try {
    const props = PropertiesService.getScriptProperties();
    props.deleteProperty("flush_scheduled_at");

    flushOne_(SHEET_ALUMNOS, "/api/sync/alumnos");
    flushOne_(SHEET_EMPLEOS, "/api/sync/empleos");

    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach((t) => {
      if (t.getHandlerFunction() === "flushQueues") ScriptApp.deleteTrigger(t);
    });
  } finally {
    lock.releaseLock();
  }
}

function flushOne_(sheetName, endpoint) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(sheetName);
  if (!sh) return;

  const props = PropertiesService.getScriptProperties();
  const qKey = "queue_" + sheetName;
  const list = String(props.getProperty(qKey) || "").trim();
  if (!list) return;

  const rowIndexes = list
    .split(",")
    .map((x) => Number(x))
    .filter((n) => n > 1);

  const now = Date.now();
  const allowed = [];
  const delayed = [];

  rowIndexes.forEach((r) => {
    const ck = "cooldown_" + sheetName + "_" + r;
    const last = Number(props.getProperty(ck) || "0");
    if ((now - last) / 1000 >= COOLDOWN_SECONDS) {
      allowed.push(r);
      props.setProperty(ck, String(now));
    } else {
      delayed.push(r);
    }
  });

  if (allowed.length === 0) {
    props.setProperty(qKey, delayed.join(","));
    return;
  }

  const rows = allowed.map((r) => getRowObject_(sh, r));

  try {
    postJson(endpoint, { rows, fullSync: false });

    if (delayed.length > 0) {
      props.setProperty(qKey, delayed.join(","));
      scheduleFlush_();
    } else {
      props.deleteProperty(qKey);
    }
  } catch (err) {
    const retryRows = Array.from(new Set(allowed.concat(delayed))).sort(
      (a, b) => a - b
    );
    props.setProperty(qKey, retryRows.join(","));
    scheduleFlush_();
    throw err;
  }
}

function onEditInstalled(e) {
  try {
    const sh = e && e.range && e.range.getSheet();
    if (!sh) return;

    const name = sh.getName();
    if (name !== SHEET_ALUMNOS && name !== SHEET_EMPLEOS) return;

    stampAsesoraForEdit_(e);

    const startRow = e.range.getRow();
    const numRows = e.range.getNumRows();
    const rows = [];
    for (let i = 0; i < numRows; i++) rows.push(startRow + i);

    queueRows_(name, rows);
  } catch (err) {
    Logger.log("onEditInstalled error: " + err);
    throw err;
  }
}

function onEdit(e) {
  // NO-OP: usar solo trigger instalable.
}
