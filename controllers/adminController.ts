import * as jobsDb from '../lib/jobsDb.js';
import { getNotificationsByUser, listLatestNotifications } from '../lib/notificationsDb.js';
import type { Request, Response } from 'express';

/**
 * GET /api/admin/jobs?status=dead
 * List jobs by status. Default status 'dead'.
 */
export async function listJobs(req: Request, res: Response): Promise<void> {
    const status  = (req.query.status as string) || 'dead';
    const rows = await jobsDb.listJobs(status);
    res.json({ data: rows });
    return;
}

/**
 * GET /api/admin/notifications?user_id=123 (optional)
 * If user_id set: list that user's notifications (limit 50).
 * Otherwise: list latest 50 across all users.
 */
export async function listNotifications(req: Request, res: Response): Promise<void> {
    const userId = req.query.user_id;
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
