// sessionStorage helpers that fall back gracefully when blocked
// (Safari ITP, Firefox ETP in cross-origin iframes, private mode, etc.)

const KEY = 'coastline.booking.v1';
let storageAvailable = null;

function probe() {
  if (storageAvailable !== null) return storageAvailable;
  try {
    const testKey = '__coastline_probe__';
    window.sessionStorage.setItem(testKey, '1');
    window.sessionStorage.removeItem(testKey);
    storageAvailable = true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Coastline: sessionStorage unavailable, falling back to in-memory state.');
    storageAvailable = false;
  }
  return storageAvailable;
}

export function loadState() {
  if (!probe()) return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

export function saveState(state) {
  if (!probe()) return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch (err) {
    // Swallow quota / privacy errors.
  }
}

export function clearState() {
  if (!probe()) return;
  try {
    window.sessionStorage.removeItem(KEY);
  } catch (err) {
    /* noop */
  }
}
