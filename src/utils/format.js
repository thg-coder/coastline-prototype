export function formatPhone(input) {
  if (!input) return '';
  const digits = String(input).replace(/\D/g, '');
  // Trim a leading "1" country code so 11-digit "1XXXXXXXXXX" becomes 10-digit.
  const ten = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  if (ten.length !== 10) return input;
  return `(${ten.slice(0, 3)}) ${ten.slice(3, 6)}-${ten.slice(6)}`;
}

export function digitsOnly(s) {
  return String(s || '').replace(/\D/g, '');
}

export function formatCardNumber(value) {
  const d = digitsOnly(value).slice(0, 19);
  return d.replace(/(.{4})/g, '$1 ').trim();
}

export function formatExpiry(value) {
  const d = digitsOnly(value).slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

export function maskCardLast4(value) {
  const d = digitsOnly(value);
  return d.slice(-4);
}

export function formatTime12h(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

export function formatDateLong(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatMoney(n) {
  return `$${Number(n).toFixed(0)}`;
}
