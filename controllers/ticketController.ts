import { getDB } from '../db/db.js';
import { getWordCount } from '../BackendHelper/getWordCount.js';
import { buildTicketConstraints } from '../BackendHelper/buildTicketConstraints.js';
import { enqueueJob } from '../lib/jobsDb.js';
import type { Request, Response } from 'express';

type CreateTicketsBody = {
    title?: string;
    body?: string;
}
export async function createTickets(req: Request, res: Response): Promise<void> {
    try{
        const db = getDB();
        const userId = req.session.userId;

        const { title = '', body = ''} = req.body as CreateTicketsBody;
        const cleanTitle = title.trim();
        const cleanBody = body.trim();

        if (!cleanTitle || !cleanBody){
            res.status(400).json({error: 'Missing inputs'});
            return;
        }

        const titleWordCountLimit = 15;
        const bodyWordCountLimit = 300;

        const titleWordCount = getWordCount(cleanTitle);
        const bodyWordCount = getWordCount(cleanBody);

        if (titleWordCount > titleWordCountLimit){
            res.status(400).json({error: 'Word count for the title should be no more than 15 words'});
            return;
        }

        if (bodyWordCount > bodyWordCountLimit){
            res.status(400).json({error: 'Word count for the body should be no more than 300 words'});
            return;
        }

        const result = await db.run(`
            INSERT INTO tickets (user_id, title, body, status)
            VALUES (?, ?, ?, ?)
            `, [userId, cleanTitle, cleanBody, 'open']);

        const ticketId = result.lastID;

        await db.run(`
            INSERT INTO audit_events (actor_user_id, action, entity_type, entity_id, after)
            VALUES (?, ?, ?, ?, ?)
            `, [userId, 'ticket_created', 'ticket', ticketId, JSON.stringify({title: cleanTitle, body: cleanBody, status: 'open'})]);

        res.status(201).json({ok: true});
        return;

    }catch(error){
        console.error(error);
        res.status(500).json({error: 'Server failed. Please try again.'});
        return;
    }
}

type GetTicketsQuery = {
    status?: string;
    search?: string;
}
export async function getTickets(req: Request, res: Response): Promise<void> {
    try{
        const db = getDB();
        const userId = req.session.userId as number;

        const rawStatus = req.query.status;
        const rawSearch = req.query.search;

        if (req.query.admin_view_condition){
            const row = await db.get('SELECT role FROM users WHERE id = ?', [userId]);
            if (!row || row.role !== 'admin') {
                res.status(403).json({ error: 'Admin only' });
                return;
            }
        }

        const rawAdminViewCondition = req.query.admin_view_condition;
        const cleanStatus = typeof rawStatus === 'string' ? rawStatus.trim().toLowerCase() : '';
        const cleanSearch = typeof rawSearch === 'string' ? rawSearch.trim() : '';
        const adminViewCondition = typeof rawAdminViewCondition === 'string' ? rawAdminViewCondition.trim().toLowerCase() : '';
 
        if (adminViewCondition !== '' && adminViewCondition !== 'me' && adminViewCondition !== 'unassigned'){
            res.status(400).json({error: 'Invalid admin view condition'});
            return;
        }
        
        const roleRow = await db.get(
            `SELECT role 
            FROM users 
            WHERE id = ?`,
            [userId]
        );

        if (!roleRow){
            res.status(401).json({error: 'Invalid user'});
            return;
        }

        const selectClause = roleRow.role === 'admin'
            ? `SELECT T.*, U.email, U.name, A.name AS assigned_admin_name
               FROM tickets T
               JOIN users U ON T.user_id = U.id
               LEFT JOIN users A ON T.assigned_admin_id = A.id`
            : `SELECT T.*, U.email, U.name
               FROM tickets T
               JOIN users U ON T.user_id = U.id`;

        const baseSqliteCode = [selectClause];

        const { whereParts:plainWhereParts, userInput:plainUserInput } = buildTicketConstraints(roleRow.role, userId, '', '', '');

        const countTicketSqliteCode = 'SELECT COUNT(*) AS total_tickets FROM tickets T';

        const totalTicketSqliteCode = plainWhereParts.length > 0 ? countTicketSqliteCode + ' WHERE ' + plainWhereParts.join(' AND ') : countTicketSqliteCode;

        const totalTicketRow = await db.get(totalTicketSqliteCode, plainUserInput);
        if (!totalTicketRow){
            res.status(404).json({error: 'No tickets found'});
            return;
        }
        const numberOfTotalTicket = totalTicketRow.total_tickets;

        const { whereParts, userInput } = buildTicketConstraints(roleRow.role, userId, cleanStatus, cleanSearch, adminViewCondition);

        if (whereParts.length > 0){
            baseSqliteCode.push('WHERE');
            baseSqliteCode.push(whereParts.join(' AND '));
        }

        const finalSqliteCode = baseSqliteCode.join(' ');
        const ticketArray = await db.all(finalSqliteCode, userInput);
        res.json({data: ticketArray, ticketsShown: ticketArray.length, totalTicket: numberOfTotalTicket});
        return;


    }catch(error){
        console.error(error);
        res.status(500).json({error: 'Server failed. Please try again.'});
        return;
    }
}



export async function getTicketsById(req: Request, res: Response): Promise<void> {
    try{
        const db = getDB();

        const rawTicketId = req.params.id;
        const ticketId = typeof rawTicketId === 'string' ? Number(rawTicketId.trim()) : Number('');

        if (!Number.isInteger(ticketId) || ticketId < 1){
            res.status(400).json({error: 'Invalid ticket id'});
            return;
        }
        const userId = req.session.userId;
    
        const checkAdminRow = await db.get(`SELECT role FROM users WHERE id = ?`, [userId]);
    
        if (!checkAdminRow){
            res.status(401).json({error: 'User not logged in. Please login again. '});
            return;
        }
       
        if (checkAdminRow.role === 'admin'){

            const ticketRow = await db.get(
                `SELECT T.*, U.email,
                 A.name AS assigned_admin_name
                 FROM tickets T
                 JOIN users U ON T.user_id = U.id
                 LEFT JOIN users A ON T.assigned_admin_id = A.id
                 WHERE T.id = ?`, [ticketId]
            );
        
            if (!ticketRow){
                res.status(404).json({error: 'Ticket not found'});
                return;
            }
        
            res.json({data: ticketRow});
            return;

        } else if (checkAdminRow.role === 'user'){
            const ticketRow = await db.get(
                `SELECT T.*, U.email FROM tickets T
                JOIN users U ON T.user_id = U.id WHERE 
                T.id = ? AND T.user_id = ?`, [ticketId, userId]
            );
        
            if (!ticketRow){
                res.status(404).json({error: 'Ticket not found'});
                return;
            }
        
            res.json({data: ticketRow});
            return;
        }

    } catch(error){
        console.error(error);
        res.status(500).json({error: 'Server failed. Please try again.'});
        return;
    }
}

type UpdateTicketsTitle_Body_StatusBody = {
    title?: string;
    body?: string;
    status?: string;
}

export async function updateTicketsTitle_Body_Status(req: Request, res: Response): Promise<void> {
    try{
        const db = getDB();

        const rawTicketId = req.params.id;
        const ticketId = typeof rawTicketId === 'string' ? Number(rawTicketId.trim()) : Number('');

        if (!Number.isInteger(ticketId) || ticketId < 1){
            res.status(400).json({error: 'Invalid ticket id'});
            return;
        }

        const userId = req.session.userId;
        const checkRole = await db.get(`SELECT role FROM users WHERE id = ?`, [userId]);

        if (!checkRole){
            res.status(401).json({error: 'Invalid user!'});
            return;
        }

        const { title = '', body = '', status = '' } = req.body as UpdateTicketsTitle_Body_StatusBody;

        const cleanTitle = title.trim();
        const cleanBody = body.trim();
        const cleanStatus = (status.trim()).toLowerCase();

        if (checkRole.role === 'user' && cleanStatus ){
            res.status(403).json({error: 'Forbidden. User trying to update status.'});
            return;
        }

        if (checkRole.role === 'admin' && (cleanTitle || cleanBody)){
            res.status(403).json({error: 'Forbidden. Admin trying to change title and body.'});
            return;
        }

        if (checkRole.role === 'admin' && !cleanStatus){
            res.status(400).json({error: 'No changes made'});
            return;
        }

        if (checkRole.role === 'admin'){

            if (cleanStatus !== 'open' && cleanStatus !== 'in_progress' && cleanStatus !== 'resolved'){
                res.status(400).json({error: 'Invalid status'});
                return;
            }

            const existingTicket = await db.get(
                `SELECT status, user_id FROM tickets WHERE id = ?`,
                [ticketId]
            );

            if (!existingTicket){
                res.status(404).json({error: 'Ticket not found'});
                return;
            }

            const oldStatus = existingTicket.status;
            const ticketOwnerId = existingTicket.user_id;

            await db.run(
                `UPDATE tickets
                SET status = ?,
                updated_at = CURRENT_TIMESTAMP
                WHERE id = ?`,
                 [cleanStatus, ticketId]
             );

            const updatedValue = await db.get(
                `SELECT * 
                FROM tickets
                WHERE id = ?
                `, [ticketId]
            );

            await db.run(
                `INSERT INTO audit_events 
                (actor_user_id, action, entity_type, entity_id, before, after)
                VALUES (?, ?, ?, ?, ?, ?)
                `, [userId, 'ticket_status_updated', 'ticket', ticketId, oldStatus, cleanStatus]
            ); 

            await enqueueJob('ticket_status_changed', { userId: ticketOwnerId, ticketId, oldStatus, newStatus: cleanStatus } );

            res.json({ok: true, data:updatedValue});
            return;

        } else if (checkRole.role === 'user'){

            const existingTicket = await db.get(
                `SELECT title, body
                FROM tickets 
                WHERE id = ? 
                AND user_id = ?
                `, [ticketId, userId]
            );

            if (!existingTicket){
                res.status(404).json({error: 'Ticket not found'});
                return;
            }

            const oldTitle = existingTicket.title;
            const oldBody = existingTicket.body;

            await db.run(
                `UPDATE tickets 
                SET title = ?, 
                body = ?, 
                updated_at = CURRENT_TIMESTAMP
                WHERE id = ? 
                AND user_id = ?`,
                [cleanTitle, cleanBody, ticketId, userId]
            );

            const updatedValue = await db.get(
                `SELECT * 
                FROM tickets
                WHERE id = ? AND user_id = ?
                `, [ticketId, userId]
            );
            
            await db.run(
                `INSERT INTO audit_events (actor_user_id, action, entity_type, entity_id, before, after)
                VALUES (?, ?, ?, ?, ?, ?)
                `, [userId, 'ticket_title_body_updated', 'ticket', ticketId, JSON.stringify({title: oldTitle, body: oldBody}), JSON.stringify({title: cleanTitle, body: cleanBody})]
            );

            res.json({ok: true, data: updatedValue});
            return;
        }

    } catch (error){
        console.error(error);
        res.status(500).json({error: 'Server failed. Please try again.'});
        return;
    }
    
}

export async function assignTicket(req: Request, res: Response): Promise<void> {
    try{
        const db = getDB();

        const rawTicketId = req.params.id;
        const ticketId = typeof rawTicketId === 'string' ? Number(rawTicketId.trim()) : Number('');

        if (!Number.isInteger(ticketId) || ticketId < 1){
            res.status(400).json({error: 'Invalid ticket id'});
            return;
        }

        const userId = req.session.userId;
        if (!userId){
            res.status(401).json({error: 'Invalid user!'});
            return;
        }
        const rawAssignedAdminId = req.body.assigned_admin_id;

        const ticketRow = await db.get(`
            SELECT user_id, assigned_admin_id FROM tickets WHERE id = ?
            `, [ticketId]);
        
        if (!ticketRow){
            res.status(404).json({error: 'Ticket not found'});
            return;
        }

        let assignedAdminId: number | null = null;
        const isUnassign = rawAssignedAdminId === null || rawAssignedAdminId === undefined || rawAssignedAdminId === '' || rawAssignedAdminId === 0;
        if (isUnassign) {
            assignedAdminId = null;
        } else {
            const parsed = Number(rawAssignedAdminId);
            if (!Number.isInteger(parsed) || parsed < 1) {
                res.status(400).json({error: 'Invalid admin id'});
                return;
            }
            const adminRow = await db.get(`
                SELECT id FROM users WHERE id = ? AND role = 'admin'
                `, [parsed]);
            if (!adminRow) {
                res.status(404).json({error: 'Admin not found'});
                return;
            }
            assignedAdminId = parsed;
        }

        if (ticketRow.assigned_admin_id === assignedAdminId){
            res.json({ok: true});
            return;
        }

        await db.run(`
            UPDATE tickets
            SET assigned_admin_id = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            `, [assignedAdminId, ticketId]);

        const beforeJson = JSON.stringify(ticketRow.assigned_admin_id);
        const afterJson = JSON.stringify(assignedAdminId);
        if (assignedAdminId !== null){
        await db.run(`
            INSERT INTO audit_events (actor_user_id, action, entity_type, entity_id, before, after)
            VALUES (?, ?, ?, ?, ?, ?)
            `, [userId, 'ticket_assigned', 'ticket', ticketId, beforeJson, afterJson]);
        }

        if (assignedAdminId !== null && assignedAdminId !== userId){
            await enqueueJob('ticket_assigned', {
                ticketId,
                assignedAdminId,
                assignedByAdminId: userId,
                oldAssignedAdminId: ticketRow.assigned_admin_id,
            });
        } else if ( assignedAdminId === null && ticketRow.assigned_admin_id !== null ){
            await db.run(`
                INSERT INTO audit_events (actor_user_id, action, entity_type, entity_id, before, after)
                VALUES (?, ?, ?, ?, ?, ?)
                `, [userId, 'ticket_unassigned', 'ticket', ticketId, beforeJson, afterJson]);
            await enqueueJob('ticket_unassigned', {
                ticketId,
                unassignedByAdminId: userId,
                oldAssignedAdminId: ticketRow.assigned_admin_id,
            });
        }
        
        res.json({ok: true});
        return;

    } catch(error){
        console.error(error);
        res.status(500).json({error: 'Server failed. Please try again.'});
        return;
    }
}