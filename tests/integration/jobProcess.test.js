import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { getDB } from '../../db/db.js';
import { loginAsAdmin } from '../helpers/authHelpers.js';
import { seed } from '../helpers/seed.js';
import { tick } from '../../lib/worker.js';

describe('jobProcess', () => {
    /** @type {number} */
    let adminId;

    /** @type {number} */
    let userBId;

    /** @type {number} */
    let ticketBId;

    beforeAll(async () => {
        const ids = await seed();
        adminId = ids.adminId;
        userBId = ids.userBId;
        ticketBId = ids.ticketBId;
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
    });
});