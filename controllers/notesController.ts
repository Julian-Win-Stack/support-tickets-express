import { getDB } from '../db/db.js';
import { getWordCount } from '../BackendHelper/getWordCount.js';
import type { Request, Response } from 'express';

type CreateNotesBody = {
    body?: string;
    cleanTicketId?: number;
}
export async function createNotes(req: Request, res: Response): Promise<void> {
    try{
        const db = getDB();
        const userId = req.session.userId;

        const isAdminRow = await db.get(`SELECT role FROM users WHERE id = ?`, [userId]);

        if (!isAdminRow){
            res.status(401).json({ error: 'Unauthorized. Please log in again.'});
            return;
        }

        if (isAdminRow.role !== 'admin'){
            res.status(403).json({error: 'Forbidden! Only admins are allowed to add notes.'});
            return;
        }

        const { body = '', cleanTicketId = 0 } = req.body as CreateNotesBody;

         const cleanBody = body.trim();

         if (!cleanBody){
            res.status(400).json({error: 'Missing inputs'});
            return;
        }

        if (!cleanTicketId){
            res.status(400).json({error: 'Missing TicketId!'});
            return;
        }

        if (!Number.isInteger(cleanTicketId) || cleanTicketId < 1){
            res.status(400).json({error: 'Invalid TicketId!'});
            return;
        }

        const wordCountLimit = 350;

        const wordCount = getWordCount(cleanBody);

        if (wordCount > wordCountLimit){
            res.status(400).json({error: 'Word count for the note should be no more than 350 words'});
            return;
        }

        await db.run(
            `INSERT INTO notes (ticket_id, admin_id, body)
            VALUES (? , ?, ?)
            `, [cleanTicketId, userId, cleanBody]
        );
        await db.run(
            `INSERT INTO audit_events (actor_user_id, action, entity_type, entity_id, after)
            VALUES (?, ?, ?, ?, ?)
            `, [userId, 'note_created', 'notes', cleanTicketId, cleanBody]
        );

        res.status(201).json({ok: true});
        return;

    }catch (error){
        console.error(error);
        res.status(500).json({error: 'Server failed. Please try again.'});
        return;
    }
}

export async function getNotes(req: Request, res: Response): Promise<void> {
    const db = getDB();

    const numberedId = Number(req.params.id as string);

    if (!Number.isInteger(numberedId) || numberedId < 1){
        res.status(400).json({error: 'Invalid TicketId!'});
        return;
    }   

    const userId = req.session.userId;
    const isAdminRow = await db.get(`SELECT role FROM users WHERE id = ?`, [userId]);

    if (!isAdminRow){
        res.status(401).json({ error: 'Unauthorized. Please log in again.'});
        return;
    }

    if (isAdminRow.role !== 'admin'){
        res.status(403).json({error: 'Forbidden! Only admins are allowed to notes.'});
        return;
    }

    const notesArray = await db.all(
        `SELECT N.created_at, N.body, U.name 
        FROM notes N
        JOIN users U
        ON N.admin_id = U.id
        WHERE N.ticket_id = ?
        `, [numberedId]
    );
    
    res.json({data: notesArray});
    return;
    
}