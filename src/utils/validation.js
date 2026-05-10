import { digitsOnly } from './format.js';

export function validateEmail(value) {
  if (!value || !value.trim()) return 'Required';
  // Reasonable email regex: local@domain.tld
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!re.test(value.trim())) return 'Enter a valid email address';
  return null;
}

export function validatePhone(value) {
  if (!value || !value.trim()) return 'Required';
  const digits = digitsOnly(value);
  // Accept 10-digit US, or 11-digit starting with 1.
  if (digits.length === 10) return null;
  if (digits.length === 11 && digits.startsWith('1')) return null;
  return 'Enter a valid 10-digit US phone number';
}

export function validateRequired(value) {
  if (value === null || value === undefined) return 'Required';
  if (typeof value === 'string' && !value.trim()) return 'Required';
  return null;
}

// DOB is a string YYYY-MM-DD from <input type="date">.
export function validateDob(value) {
  if (!value) return 'Required';
  const parts = value.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return 'Enter a valid date';
  const [y, m, d] = parts;
  const dob = new Date(y, m - 1, d);
  if (
    dob.getFullYear() !== y ||
    dob.getMonth() !== m - 1 ||
    dob.getDate() !== d
  )
    return 'Enter a valid date';
  const now = new Date();
  if (dob > now) return 'Date of birth must be in the past';
  // 18+ check: turning 18 today counts.
  let age = now.getFullYear() - dob.getFullYear();
  const beforeBirthday =
    now.getMonth() < dob.getMonth() ||
    (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate());
  if (beforeBirthday) age -= 1;
  if (age < 18) return 'You must be 18 or older to book.';
  return null;
}

// ---- Card validators (format only — this is a mock) ------------------------
export function validateCardNumber(value) {
  const d = digitsOnly(value);
  if (!d) return 'Required';
  if (d.length < 13 || d.length > 19) return 'Card number must be 13–19 digits';
  return null;
}

export function validateExpiry(value) {
  if (!value) return 'Required';
  const m = value.match(/^(\d{2})\/(\d{2})$/);
  if (!m) return 'Use MM/YY';
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return 'Invalid month';
  const now = new Date();
  // Last second of the expiry month is still valid.
  const lastDayOfMonth = new Date(year, month, 0, 23, 59, 59);
  if (lastDayOfMonth < now) return 'Card has expired';
  return null;
}

export function validateCvc(value) {
  if (!value) return 'Required';
  const d = digitsOnly(value);
  if (d.length < 3 || d.length > 4) return 'CVC must be 3 or 4 digits';
  return null;
}

export function validateZip(value) {
  if (!value) return 'Required';
  const d = digitsOnly(value);
  if (d.length !== 5) return 'ZIP must be 5 digits';
  return null;
}
