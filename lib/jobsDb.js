import { getDB } from '../db/db.js';

/**
 * @param {string} type
 * @param {object} payload
 * @returns {Promise<number>} jobId
 */
export async function enqueueJob(type, payload) {
    const db = getDB();
    const payloadJson = JSON.stringify(payload);
    const runAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const result = await db.run(`
        INSERT INTO jobs (type, payload_json, status, run_at)
        VALUES (?, ?, 'queued', ?)
        `, [type, payloadJson, runAt]);
    return result.lastID;
}


/**
 * Atomically pick one runnable job and set its status to 'processing'.
 * "Runnable" = status is 'queued' and run_at is in the past.
 * @returns {Promise<{ id: number, type: string, payload_json: string } | null>} row or null if no runnable jobs are found
 */

export async function claimNextRunnable() {
    const db = getDB();
    await db.run('BEGIN');
    try{
        const row = await db.get(`
            SELECT id, type, payload_json FROM jobs WHERE status = 'queued' AND run_at <= datetime('now')
            ORDER BY run_at ASC LIMIT 1
            `);
        if (!row) {
            await db.run('COMMIT');
            return null;
        }
        await db.run(`
            UPDATE jobs SET status = 'processing', updated_at = datetime('now') WHERE id = ?
            `, [row.id]);
        await db.run('COMMIT');
        return row;
    }catch(error){
        await db.run('ROLLBACK');
        throw error;
    }
}

export async function markSucceed(id) {
    const db = getDB();
    await db.run(`
        UPDATE jobs SET status = 'succeeded', updated_at = datetime('now') WHERE id = ?
        `, [id]);
}



/**
 * Record failure and either requeue with backoff or mark dead.
 * @param {number} id - Job id
 * @param {string} lastError - Error message to store
 * @param {{ requeue?: boolean }} options - If requeue true, put back in queue with delayed run_at; else mark dead
 */
export async function markFailed(id, lastError, options = {}) {
    const db = getDB();
    const { requeue = false } = options;
    const row = await db.get(`
        SELECT id, attempts, max_attempts, run_at FROM jobs WHERE id = ?
        `, [id]);
    if (!row){
        return;
    }
    const newAttempts = row.attempts + 1;
    if (requeue && newAttempts < row.max_attempts){
        const backoffTime = newAttempts === 1 ? 10 : 60;
        const result = await db.run(`
            UPDATE jobs SET status = 'queued', attempts = ?, run_at = datetime('now', ?), last_error = ?, updated_at = datetime('now') WHERE id = ?
            `, [newAttempts, `+${backoffTime} seconds`, lastError, id]);
        return result.lastID;
    } else {
        const result = await db.run(`
            UPDATE jobs SET status = 'dead',attempts = ?, last_error = ?, updated_at = datetime('now') WHERE id = ?
            `, [newAttempts, lastError, id]);
        return result.lastID;
    }
}


/**
 * List jobs by status (for admin API). Default status 'dead'.
 */
export async function listJobs(status = 'dead') {
    const db = getDB();
    const rows = await db.all(`
        SELECT * FROM jobs WHERE status = ? ORDER BY updated_at DESC
        `, [status]);
    return rows;
}