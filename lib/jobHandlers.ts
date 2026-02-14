import { getDB } from '../db/db.js';
import { sendNotification } from './notificationsDb.js';
import type {  AdminStatusChangePayload, TicketAssignedPayload } from '../db/types.js';

const HANDLERS = {
    ticket_status_changed: async (payload: AdminStatusChangePayload, jobId: number): Promise<void> => {
        const { userId, ticketId, oldStatus, newStatus } = payload;
        const subject = 'Ticket Status Changed';
        const message = `The status of ticket ${ticketId} has been changed from ${oldStatus} to ${newStatus}`;
        await sendNotification(userId, 'email', subject, message, 'sent', jobId);
        return
    },
    ticket_assigned: async (payload: TicketAssignedPayload, jobId: number): Promise<void> => {
        const { ticketId, assignedAdminId, assignedByAdminId } = payload;
        const db = getDB();
        const assignerRow = await db.get<{ name: string }>(
            'SELECT name FROM users WHERE id = ?',
            [assignedByAdminId]
        );
        const assignerName = assignerRow?.name ?? 'An admin';
        const subject = 'Ticket assigned to you';
        const message = `Admin ${assignerName} assigned ticket #${ticketId} to you`;
        await sendNotification(assignedAdminId, 'email', subject, message, 'sent', jobId);
        return
    },

};


/**
 * Return the async handler for a job type, or undefined if unknown.
 */
export function getHandler(type: string)
: ((payload: AdminStatusChangePayload, jobId: number) => Promise<void>) 
| ((payload: TicketAssignedPayload, jobId: number) => Promise<void>)
| undefined {
    return HANDLERS[type as keyof typeof HANDLERS];
}