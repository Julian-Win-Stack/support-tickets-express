import { getDB } from '../db/db.js';

/**
 * Use after authUser. Ensures the logged-in user has role 'admin'.
 * Returns 403 if not admin; otherwise calls next().
 */
export async function requireAdmin(req, res, next) {
    const userId = req.session.userId;
    const db = getDB();
    const row = await db.get('SELECT role FROM users WHERE id = ?', [userId]);
    if (!row || row.role !== 'admin') {
        return res.status(403).json({ error: 'Admin only' });
    }
    next();
}
