import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { getDB } from '../../db/db.js';
import { loginAsAdmin } from '../helpers/authHelpers.js';
import { seed } from '../helpers/seed.js';
import { tick } from '../../lib/worker.js';
import { getHandler } from '../../lib/jobHandlers.js';

describe('jobProcess', () => {
    /** @type {number} */
    let adminId;

    /** @type {number} */
    let userBId;

    /** @type {number} */
    let ticketBId;

    /** @type {number} */
    let ticketAdminId;

    /** @type {number} */
    let adminBId;

    beforeAll(async () => {
        const ids = await seed();
        adminId = ids.adminId;
        userBId = ids.userBId;
        ticketBId = ids.ticketBId;
        ticketAdminId = ids.ticketAdminId;
        adminBId = ids.adminBId;
    });

    describe('admin status change', () => {
        it('admin can change the status of a ticket and enqueue job should be created', async () => {
            const agent = request.agent(app);
            await loginAsAdmin(agent);
            const res = await agent
                .patch(`/api/ticket/${ticketBId}`)
                .send({ status: 'resolved' });
            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('resolved');

            await tick();
            const db = getDB();


            const notificationRow = await db.get(`
                SELECT * FROM notifications 
                WHERE user_id = ? AND subject = ? AND channel = ?
                `, [userBId, 'Ticket Status Changed', 'email']);
            expect(notificationRow).toBeDefined();
            expect(notificationRow.status).toBe('sent');
        });
        it('is idempotent: processing the same job twice does not create duplicate notifications', async () => {
            const agent = request.agent(app);
            await loginAsAdmin(agent);
            const res = await agent
                .patch(`/api/ticket/${ticketAdminId}`)
                .send({ status: 'resolved' });
            expect(res.status).toBe(200);
            expect(res.body.data.status).toBe('resolved');

            await tick();
            const db = getDB();

            const jobRow = await db.get(`
                SELECT * FROM jobs
                WHERE type = ? AND payload_json = ? AND status = ? LIMIT 1
                `, ['ticket_status_changed', JSON.stringify({ userId: adminId, ticketId: ticketAdminId, oldStatus: 'open', newStatus: 'resolved' }), 'succeeded']);
            expect(jobRow).toBeDefined();
            
            const jobId = jobRow.id;
            const handler = getHandler('ticket_status_changed');
            await handler({ userId: adminId, ticketId: ticketAdminId, oldStatus: 'open', newStatus: 'resolved' }, jobId);
            const notificationRow = await db.all(`
                SELECT * FROM notifications
                WHERE job_id = ?
                `, [jobId]);
            console.log('notificationRow', notificationRow);
            expect(notificationRow.length).toBe(1);
            expect(notificationRow[0].status).toBe('sent');
        });
        it ('ticketassignment pipeline: assign writes audit + enqueues job, tick sends notification and marks job succeeded', async () => {
            const agent = request.agent(app);
            await loginAsAdmin(agent);
            const res = await agent.patch(`/api/ticket/${ticketBId}/assign`).send({ assigned_admin_id: adminBId });
            expect(res.status).toBe(200);

            await tick();
            const db = getDB();

            const auditRow = await db.get(`
                SELECT * FROM audit_events
                WHERE entity_type = 'ticket' AND entity_id = ? AND action = 'ticket_assigned' AND actor_user_id = ?
                `, [ticketBId, adminId]);
            expect(auditRow).toBeDefined();
            expect(auditRow.before).toBe('null');
            expect(auditRow.after).toBe(adminBId.toString());

            const jobRow = await db.get(`
                SELECT * FROM jobs
                WHERE type = ? AND payload_json = ? AND status = ?
                `, ['ticket_assigned', JSON.stringify({ ticketId: ticketBId, assignedAdminId: adminBId, assignedByAdminId: adminId, oldAssignedAdminId: null }), 'succeeded']);
            expect(jobRow).toBeDefined();
            expect(jobRow.status).toBe('succeeded');

            const notificationRow = await db.get(`
                SELECT * FROM notifications
                WHERE user_id = ? AND subject = ? AND channel = ?
                `, [adminBId, 'Ticket assigned to you', 'email']);
            expect(notificationRow).toBeDefined();
            expect(notificationRow.status).toBe('sent');
        });
        it ('ticketunassignment pipeline: unassign writes audit + enqueues job, tick sends notification and marks job succeeded', async () => {
            const agent = request.agent(app);
            await loginAsAdmin(agent);
            await agent.patch(`/api/ticket/${ticketBId}/assign`).send({ assigned_admin_id: adminBId });
            const res = await agent.patch(`/api/ticket/${ticketBId}/assign`).send({ assigned_admin_id: null });
            expect(res.status).toBe(200);

            await tick();
            const db = getDB();

            const auditRow = await db.get(`
                SELECT * FROM audit_events
                WHERE entity_type = 'ticket' AND entity_id = ? AND action = 'ticket_unassigned' AND actor_user_id = ? ORDER BY id DESC LIMIT 1
                `, [ticketBId, adminId]);
            expect(auditRow).toBeDefined(); 
            expect(auditRow.before).toBe(adminBId.toString());
            expect(auditRow.after).toBe('null');

            const jobRow = await db.get(`
                SELECT * FROM jobs
                WHERE type = ? AND payload_json = ? AND status = ?
                `, ['ticket_unassigned', JSON.stringify({ ticketId: ticketBId, unassignedByAdminId: adminId, oldAssignedAdminId: adminBId }), 'succeeded']);
            expect(jobRow).toBeDefined();
            expect(jobRow.status).toBe('succeeded');

            const notificationRow = await db.get(`
                SELECT * FROM notifications
                WHERE user_id = ? AND subject = ? AND channel = ?
                `, [adminBId, 'Ticket unassigned from you', 'email']);
            expect(notificationRow).toBeDefined();
            expect(notificationRow.status).toBe('sent');
        });
    });

});
