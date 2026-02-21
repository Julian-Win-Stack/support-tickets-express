import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { getDB } from '../../db/db.js';
import { loginAsAdmin, loginAsAdminB } from '../helpers/authHelpers.js';
import { seed } from '../helpers/seed.js';

describe('notifications', () => {
    /** @type {number} Admin A (first admin) */
    let adminId;
    /** @type {number} Admin B (second admin) */
    let adminBId;
    /** @type {number} One of Admin A's unread notification IDs */
    let adminANotificationId;
    /** @type {number} One of Admin B's notification IDs (for "cannot mark someone else's" test) */
    let adminBNotificationId;
    /** @type {{ ticketId: number }} */
    let ids;

    beforeAll(async () => {
        ids = await seed();
        adminId = ids.adminId;
        adminBId = ids.adminBId;

        const db = getDB();
        await db.run('DELETE FROM notifications');

        // Admin A: 3 unread, 2 read
        for (let i = 0; i < 5; i++) {
            const readAt = i >= 3 ? new Date().toISOString().slice(0, 19).replace('T', ' ') : null;
            await db.run(
                `INSERT INTO notifications (user_id, channel, subject, message, status, job_id, ticket_id, read_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [adminId, 'email', `Subject A${i}`, `Message A${i}`, 'sent', 100 + i, ids.ticketId, readAt]
            );
        }
        const adminARow = await db.get('SELECT id FROM notifications WHERE user_id = ? AND read_at IS NULL LIMIT 1', [adminId]);
        adminANotificationId = adminARow.id;

        // Admin B: 5 unread
        for (let i = 0; i < 5; i++) {
            await db.run(
                `INSERT INTO notifications (user_id, channel, subject, message, status, job_id, ticket_id, read_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [adminBId, 'email', `Subject B${i}`, `Message B${i}`, 'sent', 200 + i, ids.ticketId, null]
            );
        }
        const adminBRow = await db.get('SELECT id FROM notifications WHERE user_id = ? LIMIT 1', [adminBId]);
        adminBNotificationId = adminBRow.id;
    });

    describe('GET /api/notifications', () => {
        it('returns only the logged-in admin\'s notifications (ownership)', async () => {
            const agent = request.agent(app);
            await loginAsAdmin(agent);
            const res = await agent.get('/api/notifications');
            expect(res.status).toBe(200);
            expect(res.body.data).toBeDefined();
            const returnedIds = res.body.data.map((n) => n.id);
            expect(returnedIds).toContain(adminANotificationId);
            expect(returnedIds).not.toContain(adminBNotificationId);
            expect(res.body.data.every((n) => n.user_id === adminId)).toBe(true);
        });

    });

    describe('GET /api/notifications/unread-count', () => {
        it('returns correct count for logged-in admin', async () => {
            const agent = request.agent(app);
            await loginAsAdmin(agent);
            const res = await agent.get('/api/notifications/unread-count');
            expect(res.status).toBe(200);
            expect(res.body.count).toBe(3);
        });
    });

    describe('PATCH /api/notifications/:id/read', () => {
        it('can mark own notification as read', async () => {
            const agent = request.agent(app);
            await loginAsAdmin(agent);
            const res = await agent.patch(`/api/notifications/${adminANotificationId}/read`);
            expect(res.status).toBe(200);
            expect(res.body.ok).toBe(true);

            const db = getDB();
            const row = await db.get('SELECT read_at FROM notifications WHERE id = ?', [adminANotificationId]);
            expect(row.read_at).not.toBeNull();
        });

        it('cannot mark someone else\'s notification (returns 404)', async () => {
            const agent = request.agent(app);
            await loginAsAdmin(agent);
            const res = await agent.patch(`/api/notifications/${adminBNotificationId}/read`);
            expect(res.status).toBe(404);
        });
    });

    describe('PATCH /api/notifications/read-all', () => {
        it('marks only current admin\'s notifications', async () => {
            const agent = request.agent(app);
            await loginAsAdmin(agent);
            const res = await agent.patch('/api/notifications/read-all');
            expect(res.status).toBe(200);
            expect(res.body.ok).toBe(true);

            const db = getDB();
            const adminAUnread = await db.get(
                'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read_at IS NULL',
                [adminId]
            );
            const adminBUnread = await db.get(
                'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read_at IS NULL',
                [adminBId]
            );
            expect(adminAUnread.count).toBe(0);
            expect(adminBUnread.count).toBe(5);
        });
    });
});
