// Shared helper: every protected function calls requireAuth(req) first.
// Returns the agency_id if the session cookie is valid, or null if not.

import crypto from 'node:crypto';

function verify(signed, secret) {
  const idx = signed.lastIndexOf('.');
  if (idx === -1) return null;
  const value = signed.slice(0, idx);
  const sig = signed.slice(idx + 1);
  const expected = crypto.createHmac('sha256', secret).update(value).digest('hex');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return value;
}

export function requireAuth(req) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;

  const cookie = req.headers.get('cookie') || '';
  const match = cookie.match(/aiq_session=([^;]+)/);
  if (!match) return null;

  const value = verify(decodeURIComponent(match[1]), secret);
  if (!value) return null;

  const parts = value.split(':'); // "agency:1:expiresTimestamp"
  if (parts[0] !== 'agency') return null;
  const expires = parseInt(parts[2], 10);
  if (Date.now() > expires) return null;

  return parseInt(parts[1], 10); // agency_id
}

export function unauthorized() {
  return new Response(JSON.stringify({ error: 'Not logged in' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' }
  });
}
