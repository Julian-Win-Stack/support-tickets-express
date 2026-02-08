import { getDB } from '../db/db.js';
import { getWordCount } from '../BackendHelper/getWordCount.js';
import { buildTicketConstraints } from '../BackendHelper/buildTicketConstraints.js';

export async function createTickets(req,res) {
    try{
        const db = getDB();
        const userId = req.session.userId;

        const { title = '', body = ''} = req.body;
        const cleanTitle = title.trim();
        const cleanBody = body.trim();

        if (!cleanTitle || !cleanBody){
            return res.status(400).json({error: 'Missing inputs'});
        }

        const titleWordCountLimit = 15;
        const bodyWordCountLimit = 300;

        const titleWordCount = getWordCount(cleanTitle);
        const bodyWordCount = getWordCount(cleanBody);

        if (titleWordCount > titleWordCountLimit){
            return res.status(400).json({error: 'Word count for the title should be no more than 15 words'});
        }

        if (bodyWordCount > bodyWordCountLimit){
            return res.status(400).json({error: 'Word count for the body should be no more than 300 words'});
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

        return res.status(201).json({ok: true});

    }catch(error){
        console.error(error);
        return res.status(500).json({error: 'Server failed. Please try again.'});
    }
}

export async function getTickets(req,res) {
    try{
        const db = getDB();
        const userId = req.session.userId;

        const { status = '', search = ''} = req.query;
        const cleanStatus = (status.trim()).toLowerCase();
        const cleanSearch = search.trim();

        const roleRow = await db.get(
            `SELECT role 
            FROM users 
            WHERE id = ?`,
            [userId]
        );

        if (!roleRow){
            return res.status(401).json({error: 'Invalid user'});
        }

        const baseSqliteCode = 
                [`SELECT T.*, U.email, U.name
                FROM tickets T
                JOIN users U ON T.user_id = U.id`];

        const { whereParts:plainWhereParts, userInput:plainUserInput } = buildTicketConstraints(roleRow.role, userId, '', '');

        const countTicketSqliteCode = 'SELECT COUNT(*) AS total_tickets FROM tickets T';

        const totalTicketSqliteCode = plainWhereParts.length > 0 ? countTicketSqliteCode + ' WHERE ' + plainWhereParts.join(' AND ') : countTicketSqliteCode;

        const totalTicketRow = await db.get(totalTicketSqliteCode, plainUserInput);
        const numberOfTotalTicket = totalTicketRow.total_tickets;

        const { whereParts, userInput } = buildTicketConstraints(roleRow.role, userId, cleanStatus, cleanSearch);

        if (whereParts.length > 0){
            baseSqliteCode.push('WHERE');
            baseSqliteCode.push(whereParts.join(' AND '));
        }

        const finalSqliteCode = baseSqliteCode.join(' ');
        const ticketArray = await db.all(finalSqliteCode, userInput);
        return res.json({data: ticketArray, ticketsShown: ticketArray.length, totalTicket: numberOfTotalTicket});


    }catch(error){
        console.error(error);
        return res.status(500).json({error: 'Server failed. Please try again.'});
    }
}



export async function getTicketsById(req,res) {
    try{
        const db = getDB();

        const ticketId = Number(req.params.id);

        if (!Number.isInteger(ticketId) || ticketId < 1){
            return res.status(400).json({error: 'Invalid ticket id'});
        }
        const userId = req.session.userId;
    
        const checkAdminRow = await db.get(`SELECT role FROM users WHERE id = ?`, [userId]);
    
        if (!checkAdminRow){
            return res.status(401).json({error: 'User not logged in. Please login again. '});
        }
       
        if (checkAdminRow.role === 'admin'){

            const ticketRow = await db.get(
                `SELECT T.*, U.email FROM tickets T
                JOIN users U ON T.user_id = U.id WHERE 
                T.id = ?`, [ticketId]
            );
        
            if (!ticketRow){
                return res.status(404).json({error: 'Ticket not found'});
            }
        
            return res.json({data: ticketRow});

        } else if (checkAdminRow.role === 'user'){
            const ticketRow = await db.get(
                `SELECT T.*, U.email FROM tickets T
                JOIN users U ON T.user_id = U.id WHERE 
                T.id = ? AND T.user_id = ?`, [ticketId, userId]
            );
        
            if (!ticketRow){
                return res.status(404).json({error: 'Ticket not found'});
            }
        
            return res.json({data: ticketRow});
        }

    } catch(error){
        console.error(error);
        return res.status(500).json({error: 'Server failed. Please try again.'});
    }
}


export async function updateTicketsTitle_Body_Status(req,res) {
    try{

        const db = getDB();

        const ticketId = Number(req.params.id);
        if (!Number.isInteger(ticketId) || ticketId <= 0){
            return res.status(400).json({error: 'Invalid ticket id'});
        }

        const userId = req.session.userId;
        const checkRole = await db.get(`SELECT role FROM users WHERE id = ?`, [userId]);

        if (!checkRole){
            return res.status(401).json({error: 'Invalid user!'});
        }

        const { title = '', body = '', status = '' } = req.body;

        const cleanTitle = title.trim();
        const cleanBody = body.trim();
        const cleanStatus = (status.trim()).toLowerCase();

        if (checkRole.role === 'user' && cleanStatus ){
            return res.status(403).json({error: 'Forbidden. User trying to update status.'});
        }

        if (checkRole.role === 'admin' && (cleanTitle || cleanBody)){
            return res.status(403).json({error: 'Forbidden. Admin trying to change title and body.'});
        }

        if (checkRole.role === 'admin' && !cleanStatus){
            return res.status(400).json({error: 'No changes made'});
        }

        if (checkRole.role === 'admin'){

            if (cleanStatus !== 'open' && cleanStatus !== 'in_progress' && cleanStatus !== 'resolved'){
                return res.status(400).json({error: 'Invalid status'});
            }

            const existingTicket = await db.get(
                `SELECT status 
                FROM tickets 
                WHERE id = ? 
                `, [ticketId]
            );

            if (!existingTicket){
                return res.status(404).json({error: 'Ticket not found'});
            }

            const oldStatus = existingTicket.status;

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
                `INSERT INTO audit_events (actor_user_id, action, entity_type, entity_id, before, after)
                VALUES (?, ?, ?, ?, ?, ?)
                `, [userId, 'ticket_status_updated', 'ticket', ticketId, oldStatus, cleanStatus]
            );

            return res.json({ok: true, data:updatedValue});

        } else if (checkRole.role === 'user'){

            const existingTicket = await db.get(
                `SELECT title, body
                FROM tickets 
                WHERE id = ? 
                AND user_id = ?
                `, [ticketId, userId]
            );

            if (!existingTicket){
                return res.status(404).json({error: 'Ticket not found'});
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

            return res.json({ok: true, data: updatedValue});
        }

    } catch (error){
        console.error(error);
        return res.status(500).json({error: 'Server failed. Please try again.'});
    }
    
}