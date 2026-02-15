import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { getDB } from '../../db/db.js';
import { loginAsAdmin, loginAsUserA, loginAsUserB } from '../helpers/authHelpers.js';
import { seed } from '../helpers/seed.js';
import { ADMIN_EMAIL, USERA_EMAIL } from '../helpers/constants.js';

describe('permissions', () => {
    /** @type {number} */
    let ticketId;
    /** @type {number} */
    let adminId;
    /** @type {number} */
    let userAId;

    beforeAll(async () => {
        const ids = await seed();
        ticketId = ids.ticketId;
        adminId = ids.adminId;
        userAId = ids.userAId;
    });

    describe('auth', () => {
        it('login succeeds and session cookie is set', async () => {
            const agent = request.agent(app);
            await loginAsUserA(agent);
            const res = await agent.get('/api/auth/me');
            expect(res.status).toBe(200);
            expect(res.body.ok).toBe(true);
        });

        it('unauthenticated user cannot access tickets list', async () => {
            const agent = request.agent(app);
            const res = await agent.get('/api/ticket');
            expect(res.status).toBe(401);
        });
    });

    describe('ticket access', () => {
        it('user cannot access another user’s ticket', async () => {
            const agent = request.agent(app);
            await loginAsUserB(agent);
            const res = await agent.get(`/api/ticket/${ticketId}`);
            expect(res.status).toBe(404);
        });

        it('user can change title and body of their own ticket', async () => {
            const agent = request.agent(app);
            await loginAsUserA(agent);
            const res = await agent
                .patch(`/api/ticket/${ticketId}`)
                .send({
                    title: 'Ticket 1 changed changed',
                    body: 'Ticket 1 body changed changed',
                });
            expect(res.status).toBe(200);
            expect(res.body.ok).toBe(true);
            expect(res.body.data.title).toBe('Ticket 1 changed changed');
            expect(res.body.data.body).toBe('Ticket 1 body changed changed');
        });

        it('user cannot change status of a ticket', async () => {
            const agent = request.agent(app);
            await loginAsUserA(agent);
            const res = await agent
                .patch(`/api/ticket/${ticketId}`)
                .send({ status: 'in_progress' });
            expect(res.status).toBe(403);
        });

        it('admin cannot change title or body of a ticket', async () => {
            const agent = request.agent(app);
            await loginAsAdmin(agent);
            const res = await agent
                .patch(`/api/ticket/${ticketId}`)
                .send({
                    title: 'Ticket 1 changed',
                    body: 'Ticket 1 body changed',
                });
            expect(res.status).toBe(403);
        });

        it('admin can change ticket status and audit + job are created', async () => {
            const agent = request.agent(app);
            await loginAsAdmin(agent);
            const res = await agent
                .patch(`/api/ticket/${ticketId}`)
                .send({ status: 'in_progress' });
            expect(res.status).toBe(200);
            expect(res.body.ok).toBe(true);
            expect(res.body.data.status).toBe('in_progress');

            const db = getDB();
            const auditRow = await db.get(
                `SELECT * FROM audit_events
                 WHERE entity_type = 'ticket' AND entity_id = ? AND action = 'ticket_status_updated' AND actor_user_id = ?
                 ORDER BY id DESC LIMIT 1`,
                [ticketId, adminId]
            );
            expect(auditRow).toBeDefined();
            expect(auditRow.before).toBe('open');
            expect(auditRow.after).toBe('in_progress');

            const jobRow = await db.get(
                `SELECT * FROM jobs
                 WHERE type = 'ticket_status_changed' AND status = 'queued'
                 ORDER BY id DESC LIMIT 1`,
                []
            );
            expect(jobRow).toBeDefined();
            const payload = JSON.parse(jobRow.payload_json);
            expect(payload.userId).toBe(userAId);
            expect(payload.ticketId).toBe(ticketId);
            expect(payload.oldStatus).toBe('open');
            expect(payload.newStatus).toBe('in_progress');
        });
        it ('Non admin user cannot assign a ticket to an admin', async () => {
            const agent = request.agent(app);
            await loginAsUserA(agent);
            const res = await agent.patch(`/api/ticket/${ticketId}/assign`).send({ assigned_admin_id: adminId });
            expect(res.status).toBe(403);
        });
        it ('Cannot assign a ticket to a user that is not an admin', async () => {
            const agent = request.agent(app);
            await loginAsUserA(agent);
            const res = await agent.patch(`/api/ticket/${ticketId}/assign`).send({ assigned_admin_id: userAId });
            expect(res.status).toBe(403);
        });
    });


    describe('notes', () => {
        it('user cannot access notes of a ticket', async () => {
            const agent = request.agent(app);
            await loginAsUserA(agent);
            const res = await agent.get(`/api/notes/${ticketId}`);
            expect(res.status).toBe(403);
        });

        it('admin can access notes of a ticket', async () => {
            const agent = request.agent(app);
            await loginAsAdmin(agent);
            const res = await agent.get(`/api/notes/${ticketId}`);
            expect(res.status).toBe(200);
        });

        it('admin can create a note and audit event is created', async () => {
            const agent = request.agent(app);
            await loginAsAdmin(agent);
            const res = await agent.post(`/api/notes/${ticketId}`).send({
                body: 'Note 2',
            });
            expect(res.status).toBe(201);
            expect(res.body.ok).toBe(true);
 
            const db = getDB();
            const auditRow = await db.get(
                `SELECT * FROM audit_events
                 WHERE entity_type = 'notes' AND entity_id = ? AND action = 'note_created' AND actor_user_id = ?
                 ORDER BY id DESC LIMIT 1`,
                [res.body.noteId, adminId]
            );
            expect(auditRow).toBeDefined();
            expect(auditRow.after).toBe('Note 2');
        });
    });

    describe('ticket creation and audit', () => {
        it('user can create a ticket and audit event is created', async () => {
            const agent = request.agent(app);
            await loginAsUserA(agent);
            const res = await agent.post('/api/ticket').send({
                title: 'Ticket 2',
                body: 'Ticket 2 body',
            });
            expect(res.status).toBe(201);
            expect(res.body.ok).toBe(true);

            const db = getDB();
            const userARow = await db.get(`SELECT id FROM users WHERE email = ?`, [USERA_EMAIL]);
            const newTicket = await db.get(
                `SELECT id FROM tickets WHERE user_id = ? AND title = ? AND body = ? AND status = ?`,
                [userARow.id, 'Ticket 2', 'Ticket 2 body', 'open']
            );
            expect(newTicket).toBeDefined();

            const auditRow = await db.get(
                `SELECT * FROM audit_events
                 WHERE entity_type = 'ticket' AND entity_id = ? AND action = 'ticket_created' AND actor_user_id = ?
                 ORDER BY id DESC LIMIT 1`,
                [newTicket.id, userARow.id]
            );
            expect(auditRow).toBeDefined();
            expect(auditRow.after).toBe(
                JSON.stringify({ title: 'Ticket 2', body: 'Ticket 2 body', status: 'open' })
            );
        });
    });
    
});
