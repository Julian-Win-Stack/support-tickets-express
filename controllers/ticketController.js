import { getDBConnection } from '../db/db.js';
import { getWordCount } from '../BackendHelper/getWordCount.js';

export async function createTickets(req,res) {
    try{
        const db = await getDBConnection();
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

        await db.run(`
            INSERT INTO tickets (user_id, title, body, status)
            VALUES (?, ?, ?, ?)
            `, [userId, cleanTitle, cleanBody, 'open']);


        return res.status(201).json({ok: true});

    }catch(error){
        console.error(error);
        return res.status(500).json({error: 'Server failed. Please try again.'});
    }
}

export async function getTickets(req,res) {
    try{

        const db = await getDBConnection();
        const userId = req.session.userId;

        const { status = '', search = ''} = req.query;
        const cleanStatus = status.trim();
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

        const mainSqliteCode = 
                [`SELECT T.*, U.email, U.name
                FROM tickets T
                JOIN users U ON T.user_id = U.id`];
        
        const joinSqliteCode = [];

        const userInput = [];

        if (roleRow.role === 'admin'){
            const totalTicketArray = await db.all(mainSqliteCode[0]);
            const numberOfTotalTicket = totalTicketArray.length;
            
            if ( cleanStatus || cleanSearch ){
                mainSqliteCode.push('WHERE');
            }

            if (cleanStatus){
                joinSqliteCode.push(`T.status = ?`);
                userInput.push(cleanStatus);
            }

            if (cleanSearch){
                const dbSearchInput = `%${cleanSearch}%`;
                joinSqliteCode.push(`(T.title LIKE ? OR T.body LIKE ?)`);
                userInput.push(dbSearchInput);
                userInput.push(dbSearchInput);
            }

            if (joinSqliteCode.length === 1){
                
                mainSqliteCode.push(joinSqliteCode[0]);
                const finalMainSqliteCode = mainSqliteCode.join(' ');
                const ticketArray = await db.all(finalMainSqliteCode, userInput);
                return res.json({data: ticketArray, totalTicket: numberOfTotalTicket, ticketsShown: ticketArray.length});
            }

            if (joinSqliteCode.length > 1 && userInput.length > 1){

                const finalJoinSqliteCode = joinSqliteCode.join(' AND ');
                mainSqliteCode.push(finalJoinSqliteCode);
                const finalMainSqliteCode = mainSqliteCode.join(' ');
                const ticketArray = await db.all(finalMainSqliteCode, userInput);
                return res.json({data: ticketArray, totalTicket: numberOfTotalTicket, ticketsShown: ticketArray.length});
            }

        return res.json({data: totalTicketArray, totalTicket: numberOfTotalTicket, ticketsShown: numberOfTotalTicket});


        } else if (roleRow.role === 'user'){

             mainSqliteCode.push('WHERE T.user_id = ?');
             userInput.push(userId);

            const totalUserTicketArray = await db.all(mainSqliteCode.join(' '), userInput);
            const numberOfTotalTicket = totalUserTicketArray.length;

            if (cleanStatus || cleanSearch){
                mainSqliteCode.push('AND');
            }

            if (cleanStatus){
                joinSqliteCode.push(`T.status = ?`);
                userInput.push(cleanStatus);
            }

            if (cleanSearch){
                const dbSearchInput = `%${cleanSearch}%`;
                joinSqliteCode.push(`(T.title LIKE ? OR T.body LIKE ?)`);
                userInput.push(dbSearchInput);
                userInput.push(dbSearchInput);
            }

            if (joinSqliteCode.length === 1){

                mainSqliteCode.push(joinSqliteCode[0]);
                const finalMainSqliteCode = mainSqliteCode.join(' ');
                const ticketArray = await db.all(finalMainSqliteCode, userInput);
                return res.json({data: ticketArray, totalTicket: numberOfTotalTicket, ticketsShown: ticketArray.length});
            }

            if (joinSqliteCode.length > 1 && userInput.length > 1){

                const finalJoinSqliteCode = joinSqliteCode.join(' AND ');
                mainSqliteCode.push(finalJoinSqliteCode);
                const finalMainSqliteCode = mainSqliteCode.join(' ');
                const ticketArray = await db.all(finalMainSqliteCode, userInput);
                return res.json({data: ticketArray, totalTicket: numberOfTotalTicket, ticketsShown: ticketArray.length});
            }

        const finalMainSqliteCode = mainSqliteCode.join(' ');
        const ticketArray = await db.all(finalMainSqliteCode, userInput);
        return res.json({data: ticketArray, totalTicket: numberOfTotalTicket, ticketsShown: ticketArray.length});

        }
    }catch(error){
        console.error(error);
        return res.status(500).json({error: 'Server failed. Please try again.'});
    }
    
}

export async function getTicketsById(req,res) {
    try{
        const db = await getDBConnection();
        const userId = req.session.userId;
    
        const checkAdminRow = await db.get(`SELECT role FROM users WHERE id = ?`, [userId]);
    
        if (!checkAdminRow){
            return res.status(401).json({error: 'User not logged in. Please login again. '});
        }
       
        const ticketId = Number(req.params.id);

        if (!Number.isInteger(ticketId) || ticketId < 1){
            return res.status(400).json({error: 'Invalid ticket id'});
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

        const db = await getDBConnection();
        const userId = req.session.userId;

        const checkRole = await db.get(`SELECT role FROM users WHERE id = ?`, [userId]);
        
        if (!checkRole){
            return res.status(401).json({error: 'Invalid user!'});
        }

        const { title = '', body = '', status = '' } = req.body;

        const cleanTitle = title.trim();
        const cleanBody = body.trim();
        const cleanStatus = status.trim();

        if (!cleanTitle || !cleanBody || !cleanStatus){
            return res.status(400).json({error: 'Missing fields'});
        }
    
        const ticketId = Number(req.params.id);
        
        if (!Number.isInteger(ticketId) || ticketId <= 0){
            return res.status(400).json({error: 'Invalid ticket id'});
        }


        if (checkRole.role === 'admin'){

            const isTicketExists = await db.get(
                `SELECT title 
                FROM tickets 
                WHERE id = ? 
                `, [ticketId]
            );

            if (!isTicketExists){
                return res.status(404).json({error: 'Ticket not found'});
            }

            const result = await db.run(
                 `UPDATE tickets SET title = ?, body = ?, status = ? WHERE id = ?`,
                 [cleanTitle, cleanBody, cleanStatus, ticketId]
             );

            if (result.changes === 0){
                return res.status(404).json({error: 'Ticket not found'});
            }
            return res.json({ok: true});

        } else if (checkRole.role === 'user'){

            const isTicketExists = await db.get(
                `SELECT title 
                FROM tickets 
                WHERE id = ? 
                AND user_id = ?
                `, [ticketId, userId]
            );

            if (!isTicketExists){
                return res.status(404).json({error: 'Ticket not found'});
            }

            const result = await db.run(
                `UPDATE tickets SET title = ?, body = ? WHERE 
                id = ? AND user_id = ?`,
                [cleanTitle, cleanBody, ticketId, userId]
            );
            
            return res.json({ok: true});
        }

    } catch (error){
        console.error(error);
        return res.status(500).json({error: 'Server failed. Please try again.'});
    }
    
}