import { sendNotification } from './notificationsDb.js';

const HANDLERS = {
    ticket_status_changed: async (payload) => {
        const { userId, ticketId, oldStatus, newStatus } = payload;
        const subject = 'Ticket Status Changed';
        const message = `The status of ticket ${ticketId} has been changed from ${oldStatus} to ${newStatus}`;
        const notificationId = await sendNotification(userId, 'email', subject, message);
        return notificationId;
    },
};


/**
 * Return the async handler for a job type, or undefined if unknown.
 * @param {string} type - Job type (e.g. 'ticket_status_changed')
 * @returns {((payload: object) => Promise<void>) | undefined}
 */
export function getHandler(type) {
    return HANDLERS[type];
}