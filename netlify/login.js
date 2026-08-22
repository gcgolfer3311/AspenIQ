// Simple single-user login for now (just Karl). Password lives in a Netlify
// environment variable, never in code. Issues a signed, httpOnly session
// cookie so the browser doesn't need to store or send a password again.

import crypto from 'node:crypto';

function sign(value, secret) {
  const h = crypto.createHmac('sha256', secret).update(value).digest('hex');
  return value + '.' + h;
}

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

export default async (req) => {
  const secret = process.env.SESSION_SECRET;
  const appPassword = process.env.APP_PASSWORD;

  if (!secret || !appPassword) {
    return new Response(JSON.stringify({ error: 'Server is not configured yet.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const body = await req.json().catch(() => ({}));
  const submitted = body.password || '';

  const a = Buffer.from(submitted);
  const b = Buffer.from(appPassword);
  const correct = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!correct) {
    return new Response(JSON.stringify({ error: 'Incorrect password' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const expires = Date.now() + 1000 * 60 * 60 * 24 * 30; // 30 days
  const token = sign('agency:1:' + expires, secret);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `aiq_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000`
    }
  });
};

export const config = { path: '/api/login' };
export { verify };
