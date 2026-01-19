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

export async function getTickets(req, res) {
    try{
        const db = await getDBConnection();
        const userId = req.session.userId;


        if (req.query){
            console.log('query is triggered')
            const { status = '', search = ''} = req.query;

            const cleanStatus = status.trim();
            const cleanSearch = search.trim();

            if (cleanStatus && !cleanSearch){
                console.log('1 is triggered')
                const statusArray = await db.all(
                    `SELECT T.*, U.email FROM tickets T
                    JOIN users U ON T.user_id = U.id WHERE 
                    T.user_id = ? AND T.status = ?`, [userId, cleanStatus]
                );

            return res.json({data : statusArray});
            }

            if (!cleanStatus && cleanSearch){
                const dbSearchInput = `%${cleanSearch}%`;

                const searchArray = await db.all(
                    `SELECT T.*, U.email FROM tickets T
                     JOIN users U ON T.user_id = U.id WHERE 
                     T.user_id = ? AND
                     (T.title LIKE ? OR T.body LIKE ?)
                    `, [userId, dbSearchInput, dbSearchInput]
                );
                return res.json({data : searchArray});
            }

            if (cleanStatus && cleanSearch){
                const dbSearchInput = `%${cleanSearch}%`;

                const combineArray = await db.all(
                    `SELECT T.*, U.email FROM tickets T
                     JOIN users U ON T.user_id = U.id WHERE 
                     T.user_id = ? AND
                     T.status = ? AND
                     (T.title LIKE ? OR T.body LIKE ?)
                    `, [userId, cleanStatus, dbSearchInput, dbSearchInput]
                );

                return res.json({data : combineArray});
                
            }

        }

        const ticketArray = await db.all(
            `SELECT T.*, U.email FROM tickets T
             JOIN users U ON T.user_id = U.id
             WHERE T.user_id = ?`, [userId]);

        return res.json({data: ticketArray});

    } catch(error){
        console.error(error);
        return res.status(500).json({error: 'Server failed. Please try again.'});
    }
    
}