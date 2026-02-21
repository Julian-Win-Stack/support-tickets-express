import { getDB } from '../db/db.js';
import { sendNotification } from './notificationsDb.js';
import type {  AdminStatusChangePayload, TicketAssignedPayload, TicketUnassignedPayload, TicketEscalatedPayload } from '../db/types.js';

const HANDLERS = {
    ticket_status_changed: async (payload: AdminStatusChangePayload, jobId: number): Promise<void> => {
        const { userId, ticketId, oldStatus, newStatus } = payload;
        const subject = 'Ticket Status Changed';
        const message = `The status of ticket ${ticketId} has been changed from ${oldStatus} to ${newStatus}`;
        await sendNotification(userId, 'email', subject, message, 'sent', jobId, ticketId);
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
        await sendNotification(assignedAdminId, 'email', subject, message, 'sent', jobId, ticketId);
        return
    },
    ticket_unassigned: async (payload: TicketUnassignedPayload, jobId: number): Promise<void> => {
        const { ticketId, unassignedByAdminId, oldAssignedAdminId } = payload;
        const db = getDB();
        const unassignerRow = await db.get<{ name: string }>(
            'SELECT name FROM users WHERE id = ?',
            [unassignedByAdminId]
        );
        const unassignerName = unassignerRow?.name ?? 'An admin';
        const subject = 'Ticket unassigned from you';
        const message = `Admin ${unassignerName} unassigned ticket #${ticketId} from you`;
        await sendNotification(oldAssignedAdminId, 'email', subject, message, 'sent', jobId, ticketId);
        return
    },
    ticket_escalated: async (payload: TicketEscalatedPayload, jobId: number): Promise<void> => {
        const { ticketId, reason } = payload;
        const subject = 'Ticket escalated';
        const message = `Ticket #${ticketId} has been escalated due to ${reason}`;
        const db = getDB();
        const assignedAdminId = await db.get(`SELECT assigned_admin_id FROM tickets WHERE id = ?`, [ticketId]);
        if (assignedAdminId.assigned_admin_id){ 
            await sendNotification(assignedAdminId.assigned_admin_id, 'email', subject, message, 'sent', jobId, ticketId);
        } else {
            const allAdmins = await db.all(`SELECT id FROM users WHERE role = 'admin'`);
            for (const admin of allAdmins){
                await sendNotification(admin.id, 'email', subject, message, 'sent', jobId, ticketId);
            }
        }
        return
    }
};


/**
 * Return the async handler for a job type, or undefined if unknown.
 */
export function getHandler(type: string)
: ((payload: AdminStatusChangePayload, jobId: number) => Promise<void>) 
| ((payload: TicketAssignedPayload, jobId: number) => Promise<void>)
| ((payload: TicketUnassignedPayload, jobId: number) => Promise<void>)
| ((payload: TicketEscalatedPayload, jobId: number) => Promise<void>)
| undefined {
    return HANDLERS[type as keyof typeof HANDLERS];
}