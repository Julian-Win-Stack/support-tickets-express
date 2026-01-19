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


        return res.status(201).json({ok: true, title: cleanTitle, body: cleanBody});


    }catch(error){
        console.error(error);
        return res.status(500).json({error: 'Server failed. Please try again.'});
    }

    
}