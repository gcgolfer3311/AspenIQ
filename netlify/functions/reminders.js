// GET  /api/reminders        -> list all reminders for the logged-in agency
// POST /api/reminders        -> create a reminder
// PUT  /api/reminders/:id    -> update a reminder (mark done, snooze, edit)
//
// This is the reference pattern: every other data type (placements, invoices,
// documents, facilities, referral partners, waitlist) follows this exact shape.

import { getDatabase } from '@netlify/database';
import { requireAuth, unauthorized } from './_auth.js';

export default async (req) => {
  const agencyId = requireAuth(req);
  if (!agencyId) return unauthorized();

  const db = getDatabase();
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();
  const hasId = id && id !== 'reminders' && !isNaN(Number(id));

  if (req.method === 'GET') {
    const rows = await db.sql`
      SELECT * FROM reminders WHERE agency_id = ${agencyId} ORDER BY date ASC
    `;
    return Response.json(rows);
  }

  if (req.method === 'POST') {
    const b = await req.json();
    const [row] = await db.sql`
      INSERT INTO reminders (agency_id, name, task, type, date, phone, done)
      VALUES (${agencyId}, ${b.name}, ${b.task || ''}, ${b.type || ''}, ${b.date || null}, ${b.phone || ''}, ${!!b.done})
      RETURNING *
    `;
    return Response.json(row, { status: 201 });
  }

  if (req.method === 'PUT' && hasId) {
    const b = await req.json();
    const [row] = await db.sql`
      UPDATE reminders SET
        name = COALESCE(${b.name}, name),
        task = COALESCE(${b.task}, task),
        date = COALESCE(${b.date}, date),
        phone = COALESCE(${b.phone}, phone),
        done = COALESCE(${b.done}, done),
        done_date = COALESCE(${b.doneDate}, done_date)
      WHERE id = ${id} AND agency_id = ${agencyId}
      RETURNING *
    `;
    if (!row) return new Response('Not found', { status: 404 });
    return Response.json(row);
  }

  if (req.method === 'DELETE' && hasId) {
    await db.sql`DELETE FROM reminders WHERE id = ${id} AND agency_id = ${agencyId}`;
    return new Response(null, { status: 204 });
  }

  return new Response('Method not allowed', { status: 405 });
};

export const config = { path: ['/api/reminders', '/api/reminders/:id'] };
