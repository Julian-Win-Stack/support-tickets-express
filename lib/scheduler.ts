import { getDB } from '../db/db.js';
import { enqueueJob } from './jobsDb.js';

let schedulerIntervalId : NodeJS.Timeout | null = null;
export async function runEscalationSweep(): Promise<void> {
    const db = getDB();
    try {
        const escalatedTickets = await db.all(`
            SELECT * FROM tickets
            WHERE escalated_at IS NULL
            AND status = 'open'
            AND created_at <= datetime('now', '-24 hours')
            LIMIT 50
        `);

        for (const ticket of escalatedTickets) {
            try {
                await db.run('BEGIN');
                const result = await db.run(`
                    UPDATE tickets
                    SET escalated_at = datetime('now')
                    WHERE id = ? AND escalated_at IS NULL
                `, [ticket.id]);

                if ((result as { changes?: number }).changes === 1) {
                    await db.run(`
                        INSERT INTO audit_events (actor_user_id, action, entity_type, entity_id, after)
                        VALUES (9999, 'escalated_ticket', 'ticket', ?, 'Ticket escalated')
                    `, [ticket.id]);
                    await db.run('COMMIT');
                    await enqueueJob('ticket_escalated', { ticketId: ticket.id, reason: 'open_over_24h' });
                } else {
                    await db.run('ROLLBACK');
                    console.warn('Ticket already escalated or not found:', ticket.id);
                }
            } catch (ticketError) {
                try {  
                    await db.run('ROLLBACK');
                } catch (_) {
                    /* no transaction to roll back */
                }
                console.error('Error escalating ticket:', ticket.id, ticketError);
                throw ticketError;
            }
        }
    } catch (error) {
        console.error('Error running escalation sweep:', error);
        throw error;
    }
}

export async function startScheduler(pollMs: number = 60000): Promise<void> {
    schedulerIntervalId = setInterval(() => {
        runEscalationSweep().catch(error => console.error('Error in scheduler:', error));
    }, pollMs);
}

export async function stopScheduler(): Promise<void> {
    if (schedulerIntervalId) {
        clearInterval(schedulerIntervalId);
        schedulerIntervalId = null; 
    }
}