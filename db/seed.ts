import bcrypt from 'bcrypt';
import { getDB } from './db.js';

const DEMO_PASSWORD = 'demo123';

/**
 * Inserts demo users, tickets, notes, audit events, and notifications.
 * Run after initDB. Skips if users already exist (idempotent for local dev).
 */
export async function seedDemo(): Promise<void> {
  const db = getDB();
  const row = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM users');
  if (row && row.count > 0) return;

  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // 1) Users: 6 total (2 admins, 4 users)
  const users = [
    { name: 'Admin A', email: 'adminA@example.com', role: 'admin' as const },
    { name: 'Admin B', email: 'adminB@example.com', role: 'admin' as const },
    { name: 'User A', email: 'userA@example.com', role: 'user' as const },
    { name: 'User B', email: 'userB@example.com', role: 'user' as const },
    { name: 'User C', email: 'userC@example.com', role: 'user' as const },
    { name: 'User D', email: 'userD@example.com', role: 'user' as const },
  ];

  const ids: Record<string, number> = {};
  for (const u of users) {
    const r = await db.run(
      `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
      [u.name, u.email, hash, u.role]
    );
    ids[u.email] = r.lastID!;
  }

  const adminA = ids['adminA@example.com'];
  const adminB = ids['adminB@example.com'];
  const userA = ids['userA@example.com'];
  const userB = ids['userB@example.com'];
  const userC = ids['userC@example.com'];
  const userD = ids['userD@example.com'];

  // 2) Tickets: 23 total (10 open, 8 in_progress, 5 resolved)
  // 4 assigned to Admin A, 4 to Admin B, rest unassigned
  // 2 escalated (open > 24h), 1 long body
  const longBody = `I've been experiencing this issue for the past two weeks. Every time I try to complete the checkout process, the page freezes after entering my payment details. I've tried on different browsers (Chrome, Firefox, Safari) and different devices (laptop, phone) with the same result. I've also cleared my cache and cookies. Could someone please look into this? My order ID was #78492. Thank you.`;

  const ticketRows: Array<{ userId: number; title: string; body: string; status: string; assignedTo?: number; escalated?: boolean; createdAgo?: string }> = [
    { userId: userA, title: 'Login not working', body: 'I cannot log in. Getting error 500.', status: 'open' },
    { userId: userA, title: 'Password reset email not received', body: 'Requested reset 2 hours ago.', status: 'in_progress', assignedTo: adminA },
    { userId: userA, title: 'Checkout page freezes', body: longBody, status: 'open', escalated: true },
    { userId: userA, title: 'Billing question', body: 'Wrong amount on last invoice.', status: 'resolved', assignedTo: adminA },
    { userId: userA, title: 'Feature request: dark mode', body: 'Would love dark mode in settings.', status: 'open' },
    { userId: userB, title: 'API rate limit unclear', body: 'What is the rate limit for /v2/users?', status: 'in_progress', assignedTo: adminA },
    { userId: userB, title: 'Export to CSV broken', body: 'Export button returns 404.', status: 'open', escalated: true },
    { userId: userB, title: 'Account merge request', body: 'I have two accounts, can you merge them?', status: 'resolved', assignedTo: adminB },
    { userId: userB, title: 'Mobile app crash on startup', body: 'App crashes immediately on iOS 17.', status: 'in_progress', assignedTo: adminB },
    { userId: userC, title: 'Refund not processed', body: 'Requested refund 5 days ago.', status: 'open' },
    { userId: userC, title: 'Wrong shipping address', body: 'I need to change the delivery address.', status: 'in_progress', assignedTo: adminA },
    { userId: userC, title: 'Subscription cancellation', body: 'How do I cancel my subscription?', status: 'resolved' },
    { userId: userC, title: 'Two-factor auth not working', body: 'SMS codes never arrive.', status: 'open' },
    { userId: userC, title: 'Dashboard loading slowly', body: 'Takes 30+ seconds to load.', status: 'in_progress', assignedTo: adminB },
    { userId: userD, title: 'Invoice PDF corrupted', body: 'Downloaded PDF is blank.', status: 'open' },
    { userId: userD, title: 'Webhook signature verification', body: 'Getting 401 on webhook calls.', status: 'in_progress', assignedTo: adminB },
    { userId: userD, title: 'Team invite not received', body: 'My colleague never got the invite.', status: 'resolved' },
    { userId: userD, title: 'Session timeout too short', body: 'Logged out after 5 minutes.', status: 'open' },
    { userId: userD, title: 'Bulk upload fails', body: 'CSV upload fails at 100 rows.', status: 'in_progress' },
    { userId: userA, title: 'Email notifications delayed', body: 'Emails arrive 2 hours late.', status: 'open' },
    { userId: userB, title: 'Profile picture not updating', body: 'Uploaded new photo but old one shows.', status: 'resolved' },
    { userId: userC, title: 'Search returns no results', body: 'Search for "invoice" returns empty.', status: 'open' },
    { userId: userD, title: 'API key rotation', body: 'How to rotate API keys without downtime?', status: 'in_progress' },
  ];

  const ticketIds: number[] = [];
  for (let i = 0; i < ticketRows.length; i++) {
    const t = ticketRows[i];
    const createdAgo = t.escalated ? "-26 hours" : undefined;
    const sql = createdAgo
      ? `INSERT INTO tickets (user_id, title, body, status, assigned_admin_id, escalated_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now', ?), datetime('now', ?))`
      : `INSERT INTO tickets (user_id, title, body, status, assigned_admin_id) VALUES (?, ?, ?, ?, ?)`;
    const params = createdAgo
      ? [t.userId, t.title, t.body, t.status, t.assignedTo ?? null, createdAgo, createdAgo]
      : [t.userId, t.title, t.body, t.status, t.assignedTo ?? null];
    const r = await db.run(sql, params);
    ticketIds.push(r.lastID!);
  }

  // Ticket IDs for notes (indices 1, 2, 6, 7, 13 = Password reset, Checkout, API rate limit, Export, Two-factor)
  const tPasswordReset = ticketIds[1];
  const tCheckout = ticketIds[2];
  const tApiRate = ticketIds[5];
  const tExport = ticketIds[6];
  const tTwoFactor = ticketIds[12];

  // 3) Notes: 10 total across 4 tickets (2-3 per ticket)
  const noteRows: Array<{ ticketId: number; adminId: number; body: string }> = [
    { ticketId: tPasswordReset, adminId: adminA, body: 'Checking with email delivery team. Will update soon.' },
    { ticketId: tPasswordReset, adminId: adminA, body: 'Reset link sent manually. Please check spam folder.' },
    { ticketId: tCheckout, adminId: adminB, body: 'Investigating payment gateway integration. This may be a known issue with Stripe.' },
    { ticketId: tCheckout, adminId: adminB, body: 'Update: We identified a conflict with ad blockers. Try disabling for our domain.' },
    { ticketId: tApiRate, adminId: adminA, body: 'Rate limit is 100 req/min for free tier. See docs: /docs/rate-limits' },
    { ticketId: tExport, adminId: adminB, body: 'Export endpoint was deprecated. Use /v2/export instead.' },
    { ticketId: tExport, adminId: adminB, body: 'Deployed fix. Please try again.' },
    { ticketId: tTwoFactor, adminId: adminA, body: 'SMS provider had an outage. Consider using authenticator app as backup.' },
    { ticketId: tTwoFactor, adminId: adminA, body: 'Outage resolved. You should receive codes now.' },
  ];

  for (const n of noteRows) {
    await db.run(`INSERT INTO notes (ticket_id, admin_id, body) VALUES (?, ?, ?)`, [n.ticketId, n.adminId, n.body]);
  }

  // 4) Audit events: ~55 total
  const auditRows: Array<{ actor: number; action: string; entityType: string; entityId: number; before?: string; after?: string }> = [];

  for (let i = 0; i < 6; i++) {
    auditRows.push({ actor: [userA, userB, userC, userD, adminA, adminB][i], action: 'user_registered', entityType: 'user', entityId: [userA, userB, userC, userD, adminA, adminB][i], after: '{}' });
  }
  for (let i = 0; i < 8; i++) {
    auditRows.push({ actor: [userA, adminA, userB, adminB, userC, adminA, userD, adminB][i], action: 'user_logged_in', entityType: 'user', entityId: [userA, adminA, userB, adminB, userC, adminA, userD, adminB][i], after: '{}' });
  }
  for (let i = 0; i < 4; i++) {
    auditRows.push({ actor: [adminA, adminB, userA, userB][i], action: 'user_logged_out', entityType: 'user', entityId: [adminA, adminB, userA, userB][i], after: '{}' });
  }

  for (let i = 0; i < Math.min(23, ticketIds.length); i++) {
    auditRows.push({ actor: [userA, userA, userB, userB, userC, userC, userC, userD, userD, userA, userB, userB, userC, userC, userD, userD, userA, userB, userC, userD, userA, userB, userC][i], action: 'ticket_created', entityType: 'ticket', entityId: ticketIds[i], after: '{}' });
  }

  auditRows.push(
    { actor: adminA, action: 'ticket_status_updated', entityType: 'ticket', entityId: ticketIds[1], before: '"open"', after: '"in_progress"' },
    { actor: adminA, action: 'ticket_assigned', entityType: 'ticket', entityId: ticketIds[1], after: JSON.stringify(adminA) },
    { actor: adminA, action: 'ticket_status_updated', entityType: 'ticket', entityId: ticketIds[3], before: '"in_progress"', after: '"resolved"' },
    { actor: adminB, action: 'ticket_assigned', entityType: 'ticket', entityId: ticketIds[7], after: JSON.stringify(adminB) },
    { actor: adminB, action: 'ticket_status_updated', entityType: 'ticket', entityId: ticketIds[7], before: '"in_progress"', after: '"resolved"' },
    { actor: adminA, action: 'ticket_assigned', entityType: 'ticket', entityId: ticketIds[5], after: JSON.stringify(adminA) },
    { actor: adminB, action: 'ticket_assigned', entityType: 'ticket', entityId: ticketIds[6], after: JSON.stringify(adminB) },
    { actor: adminB, action: 'escalated_ticket', entityType: 'ticket', entityId: ticketIds[6], after: '{}' },
    { actor: adminA, action: 'escalated_ticket', entityType: 'ticket', entityId: ticketIds[2], after: '{}' },
    { actor: adminA, action: 'ticket_title_body_updated', entityType: 'ticket', entityId: ticketIds[0], before: '{}', after: '{}' },
    { actor: adminB, action: 'ticket_unassigned', entityType: 'ticket', entityId: ticketIds[8], before: JSON.stringify(adminB), after: 'null' }
  );

  for (let i = 0; i < noteRows.length; i++) {
    const n = noteRows[i];
    const noteId = i + 1;
    auditRows.push({ actor: n.adminId, action: 'note_created', entityType: 'notes', entityId: noteId, after: JSON.stringify(n.body) });
  }

  for (const a of auditRows) {
    await db.run(
      `INSERT INTO audit_events (actor_user_id, action, entity_type, entity_id, before, after) VALUES (?, ?, ?, ?, ?, ?)`,
      [a.actor, a.action, a.entityType, a.entityId, a.before ?? null, a.after ?? null]
    );
  }

  // 5) Notifications: 20 total (6-10 unread per admin, rest read)
  let jobId = 1001;
  const notifRows: Array<{ userId: number; subject: string; message: string; ticketId: number; read: boolean }> = [
    { userId: adminA, subject: 'Ticket assigned to you', message: 'Ticket #2 has been assigned to you.', ticketId: ticketIds[1], read: false },
    { userId: adminA, subject: 'Ticket status changed', message: 'Ticket #4 status changed to resolved.', ticketId: ticketIds[3], read: true },
    { userId: adminA, subject: 'Ticket assigned to you', message: 'Ticket #6 has been assigned to you.', ticketId: ticketIds[5], read: false },
    { userId: adminA, subject: 'Ticket escalated', message: 'Ticket #3 has been escalated due to open_over_24h.', ticketId: ticketIds[2], read: false },
    { userId: adminA, subject: 'Ticket assigned to you', message: 'Ticket #10 has been assigned to you.', ticketId: ticketIds[9], read: true },
    { userId: adminA, subject: 'Ticket status changed', message: 'Ticket #19 status changed to in_progress.', ticketId: ticketIds[18], read: false },
    { userId: adminA, subject: 'Ticket unassigned', message: 'Ticket #9 has been unassigned from you.', ticketId: ticketIds[8], read: true },
    { userId: adminA, subject: 'Ticket assigned to you', message: 'Ticket #18 has been assigned to you.', ticketId: ticketIds[17], read: false },
    { userId: adminB, subject: 'Ticket assigned to you', message: 'Ticket #8 has been assigned to you.', ticketId: ticketIds[7], read: true },
    { userId: adminB, subject: 'Ticket escalated', message: 'Ticket #7 has been escalated due to open_over_24h.', ticketId: ticketIds[6], read: false },
    { userId: adminB, subject: 'Ticket assigned to you', message: 'Ticket #9 has been assigned to you.', ticketId: ticketIds[8], read: false },
    { userId: adminB, subject: 'Ticket status changed', message: 'Ticket #8 status changed to resolved.', ticketId: ticketIds[7], read: true },
    { userId: adminB, subject: 'Ticket assigned to you', message: 'Ticket #14 has been assigned to you.', ticketId: ticketIds[13], read: false },
    { userId: adminB, subject: 'Ticket assigned to you', message: 'Ticket #16 has been assigned to you.', ticketId: ticketIds[15], read: true },
    { userId: adminB, subject: 'Ticket status changed', message: 'Ticket #23 status changed to in_progress.', ticketId: ticketIds[22], read: false },
    { userId: adminB, subject: 'Ticket unassigned', message: 'Ticket #9 has been unassigned from you.', ticketId: ticketIds[8], read: false },
    { userId: adminA, subject: 'Ticket status changed', message: 'Ticket #2 status changed to in_progress.', ticketId: ticketIds[1], read: true },
    { userId: adminB, subject: 'Ticket assigned to you', message: 'Ticket #15 has been assigned to you.', ticketId: ticketIds[14], read: true },
    { userId: adminA, subject: 'Ticket escalated', message: 'Ticket #2 has been escalated.', ticketId: ticketIds[1], read: false },
    { userId: adminB, subject: 'Ticket status changed', message: 'Ticket #16 status changed to resolved.', ticketId: ticketIds[15], read: false },
  ];

  for (const n of notifRows) {
    const readAt = n.read ? "datetime('now')" : 'NULL';
    await db.run(
      `INSERT INTO notifications (user_id, channel, subject, message, status, job_id, ticket_id, read_at) VALUES (?, ?, ?, ?, ?, ?, ?, ${readAt})`,
      [n.userId, 'email', n.subject, n.message, 'sent', jobId++, n.ticketId]
    );
  }

  console.log('Demo data seeded.');
}
