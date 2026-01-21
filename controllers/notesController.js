// go and check other params and queries as well. 
import { getDBConnection } from '../db/db.js';
import { getWordCount } from '../BackendHelper/getWordCount.js';

export async function createNotes(req,res) {
    try{
        const db = await getDBConnection();
        const userId = req.session.userId;

        const isAdminRow = await db.get(`SELECT role FROM users WHERE id = ?`, [userId]);

        if (isAdminRow.role !== 'admin' || !isAdminRow){
            return res.status(403).json({error: 'Forbidden! Only admins are allowed to add notes.'});
        }

        const { body = '', ticketId = '' } = req.body;

         const cleanBody = body.trim();
         const cleanTicketId = ticketId.trim();

         if (!cleanBody){
            return res.status(400).json({error: 'Missing inputs'});
        }

        if (!cleanTicketId){
            return res.status(400).json({error: 'Missing TicketId!'});
        }

        const numberedTicketId = Number(cleanTicketId);

        if (!Number.isInteger(numberedTicketId) || Number.isNaN(numberedTicketId) || numberedTicketId < 1){
            return res.status(400).json({error: 'Invalid TicketId!'});
        }

        const wordCountLimit = 350;

        const wordCount = getWordCount(cleanBody);

        console.log(wordCount);

        if (wordCount > wordCountLimit){
            return res.status(400).json({error: 'Word count for the note should be no more than 350 words'});
        }

        await db.run(
            `INSERT INTO notes (ticket_id, admin_id, body)
            VALUES (? , ?, ?)
            `, [numberedTicketId, userId, cleanBody]
        );

        return res.status(201).json({ok: true});

    }catch (error){
        console.error(error);
        return res.status(500).json({error: 'Server failed. Please try again.'});
    }
}

export async function getNotes(req,res) {
    const db = await getDBConnection();

    const userId = req.session.userId;
    const isAdminRow = await db.get(`SELECT role FROM users WHERE id = ?`, [userId]);

    if (isAdminRow.role !== 'admin' || !isAdminRow){
        return res.status(403).json({error: 'Forbidden! Only admins are allowed to add notes.'});
    }

    const { id = '' } = req.params;

    const cleanId = id.trim();

    if (!cleanId){
        return res.status(400).json({error: 'Missing TicketId!'});
    }

    const numberedId = Number(cleanId);

    if (!Number.isInteger(numberedId) || Number.isNaN(numberedId) || numberedId < 1){
        return res.status(400).json({error: 'Invalid TicketId!'});
    }   

    const notesArray = await db.all(
        `SELECT N.created_at, N.body, U.name 
        FROM notes N
        JOIN users U
        ON N.admin_id = U.id
        WHERE N.ticket_id = ?
        `, [numberedId]
    );

    console.log(notesArray);
    return res.json({data: notesArray});
    
}