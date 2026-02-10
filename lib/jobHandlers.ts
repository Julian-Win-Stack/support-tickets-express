import { sendNotification } from './notificationsDb.js';
import type { AdminStatusChangePayload } from '../db/types.js';

const HANDLERS = {
    ticket_status_changed: async (payload: AdminStatusChangePayload): Promise<number> => {
        const { userId, ticketId, oldStatus, newStatus } = payload;
        const subject = 'Ticket Status Changed';
        const message = `The status of ticket ${ticketId} has been changed from ${oldStatus} to ${newStatus}`;
        const notificationId = await sendNotification(userId, 'email', subject, message, 'sent');
        return notificationId;
    },
};


/**
 * Return the async handler for a job type, or undefined if unknown.
 */
export function getHandler(type: string): ((payload: AdminStatusChangePayload) => Promise<number>) | undefined {
    return HANDLERS[type as keyof typeof HANDLERS];
}