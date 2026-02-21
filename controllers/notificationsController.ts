import type { Request, Response } from 'express';
import { getDB } from '../db/db.js';

/**
 * GET /api/notifications
 * List the current admin's notifications (newest first, no limit).
 */
export async function listMyNotifications(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.session.userId;
        if (!userId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        const db = getDB();
        const rows = await db.all(
            `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`,
            [userId]
        );
        res.json({ data: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server failed. Please try again.' });
    }
}

/**
 * GET /api/notifications/unread-count
 * Return { count: number } for unread notifications.
 */
export async function getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.session.userId;
        if (!userId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        const db = getDB();
        const row = await db.get<{ count: number }>(
            `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read_at IS NULL`,
            [userId]
        );
        res.json({ count: row?.count ?? 0 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server failed. Please try again.' });
    }
}

/**
 * PATCH /api/notifications/:id/read
 * Mark one notification as read.
 */
export async function readOneNotification(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.session.userId;
        if (!userId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id < 1) {
            res.status(400).json({ error: 'Invalid notification id' });
            return;
        }
        const db = getDB();
        const result = await db.run(
            `UPDATE notifications SET read_at = datetime('now') WHERE id = ? AND user_id = ?`,
            [id, userId]
        );
        if ((result.changes ?? 0) === 0) {
            res.status(404).json({ error: 'Notification not found' });
            return;
        }
        res.json({ ok: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server failed. Please try again.' });
    }
}

/**
 * PATCH /api/notifications/:id/unread
 * Mark one notification as unread (set read_at to NULL).
 */
export async function unReadOneNotification(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.session.userId;
        if (!userId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id < 1) {
            res.status(400).json({ error: 'Invalid notification id' });
            return;
        }
        const db = getDB();
        const result = await db.run(
            `UPDATE notifications SET read_at = NULL WHERE id = ? AND user_id = ?`,
            [id, userId]
        );
        if ((result.changes ?? 0) === 0) {
            res.status(404).json({ error: 'Notification not found' });
            return;
        }
        res.json({ ok: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server failed. Please try again.' });
    }
}

/**
 * PATCH /api/notifications/read-all
 * Mark all of the current admin's notifications as read.
 */
export async function markAllNotificationsRead(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.session.userId;
        if (!userId) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        const db = getDB();
        await db.run(
            `UPDATE notifications SET read_at = datetime('now') WHERE user_id = ? AND read_at IS NULL`,
            [userId]
        );
        res.json({ ok: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server failed. Please try again.' });
    }
}


