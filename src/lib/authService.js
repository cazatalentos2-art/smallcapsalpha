const SESSION_KEY = 'vlab_session';
const PENDING_2FA_KEY = 'vlab_pending_2fa';

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
  } catch {
    return null;
  }
}

export function saveSession(userId, userEmail, userName) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
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
  } catch {
    return null;
  }
}

export function savePending2FA(userId, phone) {
  localStorage.setItem(PENDING_2FA_KEY, JSON.stringify({ userId, phone }));
}

export function clearPending2FA() {
  localStorage.removeItem(PENDING_2FA_KEY);
}

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') || '';

async function request(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}/${endpoint.replace(/^\/+/, '')}`, {
    method: options.method || 'GET',
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {})
    },
    credentials: 'include',
    body: options.body
      ? (options.body instanceof FormData || typeof options.body === 'string' ? options.body : JSON.stringify(options.body))
      : undefined
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();

  if (!res.ok) {
    throw new Error(data?.message || data?.error || `Error ${res.status}`);
  }

  return data;
}

export async function register({ email, password, fullName, phone }) {
  const salt = generateToken(16);
  const hash = await hashPassword(password, salt);

  return request('auth/register.php', {
    method: 'POST',
    body: {
      email: email.toLowerCase().trim(),
      password_hash: `${salt}:${hash}`,
      full_name: fullName.trim(),
      phone: phone.trim()
    }
  });
}

export async function login({ email, password }) {
  const response = await request('auth/login.php', {
    method: 'POST',
    body: {
      email: email.toLowerCase().trim(),
      password
    }
  });

  if (response?.requires2FA) {
    savePending2FA(response.userId, response.phone);
    return {
      userId: response.userId,
      phone: response.phone,
      code: response.code
    };
  }

  return response;
}

export async function verify2FA({ userId, code }) {
  const response = await request('auth/verify-2fa.php', {
    method: 'POST',
    body: { userId, code: code.trim() }
  });

  if (response?.user) {
    clearPending2FA();
    saveSession(response.user.id, response.user.email, response.user.full_name);
  }

  return response;
}

export async function resend2FA(userId) {
  return request('auth/resend-2fa.php', {
    method: 'POST',
    body: { userId }
  });
}