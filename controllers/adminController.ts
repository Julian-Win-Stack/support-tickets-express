import * as jobsDb from '../lib/jobsDb.js';
import { getNotificationsByUser, listLatestNotifications } from '../lib/notificationsDb.js';
import type { Request, Response } from 'express';
import { getDB } from '../db/db.js';
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

const VALID_AUDIT_ACTIONS = new Set([
    'ticket_status_updated',
    'ticket_assigned',
    'ticket_unassigned',
    'ticket_created',
    'ticket_title_body_updated',
    'note_created',
    'escalated_ticket',
    'user_registered',
    'user_logged_in',
    'user_logged_out',
]);

const VALID_ENTITY_TYPES = new Set(['ticket', 'notes', 'user']);

/** Escape LIKE wildcards so user input is treated as literal. */
function escapeLikePattern(s: string): string {
    return s.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

/**
 * GET /api/admin/audit-events?offset=0&action=...&entity_type=...&search=... (optional)
 * List audit events, newest first. Limit 50 per request. Offset for load-more pagination.
 * Optional filters: ?action=..., ?entity_type=ticket|notes|user, ?search=... (matches name or email)
 */
export async function listAuditEvents(req: Request, res: Response): Promise<void> {
    try {
        const rawOffset = req.query.offset;
        const offset = typeof rawOffset === 'string' ? Number(rawOffset.trim()) : 0;
        if (!Number.isInteger(offset) || offset < 0) {
            res.status(400).json({ error: 'Invalid offset' });
            return;
        }
        const rawAction = req.query.action;
        const action =
            typeof rawAction === 'string' && rawAction.trim()
                ? rawAction.trim()
                : undefined;
        if (action !== undefined && !VALID_AUDIT_ACTIONS.has(action)) {
            res.status(400).json({ error: 'Invalid action' });
            return;
        }
        const rawEntityType = req.query.entity_type;
        const entityType =
            typeof rawEntityType === 'string' && rawEntityType.trim()
                ? rawEntityType.trim()
                : undefined;
        if (entityType !== undefined && !VALID_ENTITY_TYPES.has(entityType)) {
            res.status(400).json({ error: 'Invalid entity_type' });
            return;
        }
        const rawSearch = req.query.search;
        const search =
            typeof rawSearch === 'string' && rawSearch.trim()
                ? rawSearch.trim()
                : undefined;
        const db = getDB();
        const conditions: string[] = [];
        const params: (string | number)[] = [];
        if (action) {
            conditions.push('a.action = ?');
            params.push(action);
        }
        if (entityType) {
            conditions.push('a.entity_type = ?');
            params.push(entityType);
        }
        if (search) {
            const pattern = `%${escapeLikePattern(search)}%`;
            conditions.push('(u.email LIKE ? OR u.name LIKE ?)');
            params.push(pattern, pattern);
        }
        const whereClause =
            conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        params.push(offset);
        const sql = `SELECT a.id, a.actor_user_id, a.action, a.entity_type, a.entity_id, a.before, a.after, a.created_at,
             u.name AS actor_name, u.email AS actor_email, u.role AS actor_role
             FROM audit_events a
             LEFT JOIN users u ON a.actor_user_id = u.id
             ${whereClause}
             ORDER BY a.created_at DESC LIMIT 50 OFFSET ?`;
        const rows = await db.all(sql, params);
        res.json({ data: rows });
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server failed. Please try again.' });
        return;
    }
}

/**
 * GET /api/admin/users
 * List all users.
 */
export async function listUsers(req: Request, res: Response): Promise<void> {
    try {
        const db = getDB();
        const admins = await db.all(`SELECT id, name, email, role FROM users WHERE role = 'admin'`);
        res.json({ data: admins });
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server failed. Please try again.' });
        return;
    }
}