import * as jobsDb from '../lib/jobsDb.js';
import { getNotificationsByUser, listLatestNotifications } from '../lib/notificationsDb.js';

/**
 * GET /api/admin/jobs?status=dead
 * List jobs by status. Default status 'dead'.
 */
export async function listJobs(req, res) {
    const status = req.query.status || 'dead';
    const rows = await jobsDb.listJobs(status);
    return res.json({ data: rows });
}

/**
 * GET /api/admin/notifications?user_id=123 (optional)
 * If user_id set: list that user's notifications (limit 50).
 * Otherwise: list latest 50 across all users.
 */
export async function listNotifications(req, res) {
    const userId = req.query.user_id;
    if (userId) {
        const id = Number(userId);
        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).json({ error: 'Invalid user_id' });
        }
        const rows = await getNotificationsByUser(id, 50);
        return res.json({ data: rows });
    }
    const rows = await listLatestNotifications(50);
    return res.json({ data: rows });
}
