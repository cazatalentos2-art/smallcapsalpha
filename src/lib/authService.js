// Custom auth service — handles register, login, 2FA
import { base44 } from '@/api/base44Client';

const SESSION_KEY = 'vlab_session';
const PENDING_2FA_KEY = 'vlab_pending_2fa';

// Simple hash function (SHA-256 via Web Crypto API)
async function hashPassword(password, salt = '') {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateToken(length = 64) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  array.forEach(b => { token += chars[b % chars.length]; });
  return token;
}

function generateOTP() {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(100000 + (array[0] % 900000));
}

// ---- Session helpers ----
export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (new Date(s.expiresAt) < new Date()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch { return null; }
}

export function saveSession(userId, userEmail, userName) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days
  const session = { userId, userEmail, userName, expiresAt };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(PENDING_2FA_KEY);
}

export function getPending2FA() {
  try {
    const raw = localStorage.getItem(PENDING_2FA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function savePending2FA(userId, phone) {
  localStorage.setItem(PENDING_2FA_KEY, JSON.stringify({ userId, phone }));
}

export function clearPending2FA() {
  localStorage.removeItem(PENDING_2FA_KEY);
}

// ---- Auth operations ----

export async function register({ email, password, fullName, phone }) {
  // Check if email already exists
  const existing = await base44.entities.AppUser.filter({ email: email.toLowerCase().trim() });
  if (existing && existing.length > 0) {
    throw new Error('Este email ya está registrado.');
  }

  const salt = generateToken(16);
  const hash = await hashPassword(password, salt);

  const user = await base44.entities.AppUser.create({
    email: email.toLowerCase().trim(),
    password_hash: `${salt}:${hash}`,
    full_name: fullName.trim(),
    phone: phone.trim(),
    is_verified: true, // auto-verify for now
  });

  return user;
}

export async function login({ email, password }) {
  const users = await base44.entities.AppUser.filter({ email: email.toLowerCase().trim() });
  if (!users || users.length === 0) {
    throw new Error('Email o contraseña incorrectos.');
  }

  const user = users[0];
  const [salt, storedHash] = (user.password_hash || '').split(':');
  if (!salt || !storedHash) throw new Error('Error en las credenciales.');

  const inputHash = await hashPassword(password, salt);
  if (inputHash !== storedHash) {
    throw new Error('Email o contraseña incorrectos.');
  }

  // Generate 2FA code
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

  await base44.entities.AppUser.update(user.id, {
    two_fa_code: code,
    two_fa_expires_at: expiresAt,
    two_fa_attempts: 0,
  });

  // Save pending 2FA state
  savePending2FA(user.id, user.phone);

  return { userId: user.id, phone: user.phone, code }; // code returned so UI can show it (until WhatsApp is wired)
}

export async function verify2FA({ userId, code }) {
  const users = await base44.entities.AppUser.filter({ id: userId });
  if (!users || users.length === 0) throw new Error('Sesión inválida.');

  const user = users[0];

  if ((user.two_fa_attempts || 0) >= 5) {
    throw new Error('Demasiados intentos. Vuelve a iniciar sesión.');
  }

  if (!user.two_fa_code || !user.two_fa_expires_at) {
    throw new Error('No hay un código activo. Inicia sesión de nuevo.');
  }

  if (new Date(user.two_fa_expires_at) < new Date()) {
    throw new Error('El código ha expirado. Inicia sesión de nuevo.');
  }

  if (user.two_fa_code !== code.trim()) {
    await base44.entities.AppUser.update(user.id, {
      two_fa_attempts: (user.two_fa_attempts || 0) + 1,
    });
    throw new Error('Código incorrecto.');
  }

  // Valid — clear code, create session
  const sessionToken = generateToken();
  const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  await base44.entities.AppUser.update(user.id, {
    two_fa_code: '',
    two_fa_attempts: 0,
    last_login: new Date().toISOString(),
    session_token: sessionToken,
    session_expires_at: sessionExpiry,
  });

  clearPending2FA();
  const session = saveSession(user.id, user.email, user.full_name);
  return { user, session };
}

export async function resend2FA(userId) {
  const users = await base44.entities.AppUser.filter({ id: userId });
  if (!users || users.length === 0) throw new Error('Usuario no encontrado.');
  const user = users[0];

  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await base44.entities.AppUser.update(user.id, {
    two_fa_code: code,
    two_fa_expires_at: expiresAt,
    two_fa_attempts: 0,
  });

  return { phone: user.phone, code };
}