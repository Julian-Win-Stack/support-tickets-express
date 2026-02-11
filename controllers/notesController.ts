import { getDB } from '../db/db.js';
import { getWordCount } from '../BackendHelper/getWordCount.js';
import type { Request, Response } from 'express';

type CreateNotesBody = {
    body?: string;
}
export async function createNotes(req: Request, res: Response): Promise<void> {
    try{
        const db = getDB();
        const userId = req.session.userId;


        const rawTicketId = req.params.ticketId;
        const cleanTicketId = typeof rawTicketId === 'string' ? Number(rawTicketId.trim()) : Number('');

        const { body = '' } = req.body as CreateNotesBody;

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

        const result = await db.run(
            `INSERT INTO notes (ticket_id, admin_id, body)
            VALUES (? , ?, ?)
            `, [cleanTicketId, userId, cleanBody]
        );

        await db.run(
            `INSERT INTO audit_events (actor_user_id, action, entity_type, entity_id, after)
            VALUES (?, ?, ?, ?, ?)
            `, [userId, 'note_created', 'notes', result.lastID, cleanBody]
        );

        res.status(201).json({ok: true, noteId: result.lastID});
        return;

    }catch (error){
        console.error(error);
        res.status(500).json({error: 'Server failed. Please try again.'});
        return;
    }
}

export async function getNotes(req: Request, res: Response): Promise<void> {
    
    const rawNumberedId = req.params.id;
    const numberedId = typeof rawNumberedId === 'string' ? Number(rawNumberedId.trim()) : Number('');

    if (!Number.isInteger(numberedId) || numberedId < 1){
        res.status(400).json({error: 'Invalid TicketId!'});
        return;
    }   
    
    try{
        const db = getDB();
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
    }catch (error){
        console.error(error);
        res.status(500).json({error: 'Server failed. Please try again.'});
        return;
    }
}