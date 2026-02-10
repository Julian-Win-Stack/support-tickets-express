import * as jobsDb from '../lib/jobsDb.js';
import { getNotificationsByUser, listLatestNotifications } from '../lib/notificationsDb.js';
import type { Request, Response } from 'express';

/**
 * GET /api/admin/jobs?status=dead
 * List jobs by status. Default status 'dead'.
 */
export async function listJobs(req: Request, res: Response): Promise<void> {
    try { 
    const rawStatus = req.query.status;
    const status = typeof rawStatus === 'string' ? rawStatus.trim().toLowerCase() : 'dead';
    if (status !== 'dead' && status !== 'queued' && status !== 'processing' && status !== 'succeeded'){
        res.status(400).json({ error: 'Invalid status' });
        return;
    }
    const rows = await jobsDb.listJobs(status);
    res.json({ data: rows });
    return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server failed. Please try again.' });
        return;
    }
}

/**
 * GET /api/admin/notifications?user_id=123 (optional)
 * If user_id set: list that user's notifications (limit 50).
 * Otherwise: list latest 50 across all users.
 */
export async function listNotifications(req: Request, res: Response): Promise<void> {
    const rawUserId = req.query.user_id;
    const userId = typeof rawUserId === 'string' ? rawUserId.trim() : undefined;
    if (userId) {
        const id = Number(userId);
        if (!Number.isInteger(id) || id < 1) {
            res.status(400).json({ error: 'Invalid user_id' });
            return;
        }
        const rows = await getNotificationsByUser(id, 50);
        res.json({ data: rows });
        return;
    }
    const rows = await listLatestNotifications(50);
    res.json({ data: rows });
    return;
}
