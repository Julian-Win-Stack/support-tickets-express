import bcrypt from 'bcrypt';
import { getDB } from '../db/db.js';

export async function registerUser(req,res) {
    try{
        const db = getDB();
        const { registerName = '', registerEmail = '', registerPassword = '' } = req.body;
    
        const cleanName = registerName.trim();
        const cleanEmail = registerEmail.trim();
    
        if (!cleanName || !cleanEmail || !registerPassword){
            return res.status(400).json({error: 'Missing input fields'});
        }

        const isEmailDuplicate = await db.get(`
            SELECT id FROM users 
            WHERE email = ?
            `, [cleanEmail]);

        if (isEmailDuplicate){
            return res.status(400).json({error: 'Duplicate Email'});
        }
    
        const saltRounds = 10;
    
        const passwordHash = await bcrypt.hash(registerPassword, saltRounds);
    
        const result = await db.run(`
            INSERT INTO users (name, email, password_hash)
            VALUES (?, ?, ?)
            `, [cleanName, cleanEmail, passwordHash]);
        
        const userId = result.lastID;

        await db.run(
            `INSERT INTO audit_events (actor_user_id, action, entity_type, entity_id, after)
            VALUES (?, ?, ?, ?, ?)
            `, [userId, 'user_registered', 'user', userId, JSON.stringify({ authenticated: true })]
        );

        return res.status(201).json({ok: true})

        } catch (error){
        console.error(error);
        return res.status(500).json({error: 'Server failed. Please try again.'});
    }
}

export async function loginUser(req,res) {
    try{
        const db = getDB();
        const { loginEmail = '', loginPassword = '' } = req.body;
    
        const cleanEmail = loginEmail.trim();
    
        if (!cleanEmail || !loginPassword){
            return res.status(400).json({error: 'Missing input fields'});
        }

        const dbRow = await db.get(`
            SELECT password_hash, id, name, role FROM users 
            WHERE email = ?
            `, [cleanEmail]);

        if (!dbRow){
            return res.status(400).json({error: 'Incorrect email'});
        }

        const dbPasswordHash = dbRow.password_hash;

        const isPasswordMatch = await bcrypt.compare(loginPassword, dbPasswordHash);

        if (!isPasswordMatch){
            return res.status(400).json({error: 'Incorrect password'});
        }

        req.session.userId = dbRow.id;

        await db.run(
            `INSERT INTO audit_events (actor_user_id, action, entity_type, entity_id, after)
            VALUES (?, ?, ?, ?, ?)
            `, [dbRow.id, 'user_logged_in', 'user', dbRow.id, JSON.stringify({ authenticated: true })]
        );

        return res.json({ok: true, name: dbRow.name, role: dbRow.role});

    }catch (error){
        console.error(error);
        return res.status(500).json({error: 'Server failed. Please try again.'});
    }
    
}

export async function logoutUser(req,res) {

    if (!req.session){
        return res.json({ok: true});
    }
    const userId = req.session.userId;

    req.session.destroy( (error)=>{
        if (error){
            console.error(error);
            return res.status(500).json({error: 'User failed to logout. Please try again.'});
        }
    res.clearCookie('sid');
    });
    const db = getDB();
    await db.run(
        `INSERT INTO audit_events (actor_user_id, action, entity_type, entity_id, after)
        VALUES (?, ?, ?, ?, ?)
        `, [userId, 'user_logged_out', 'user', userId, JSON.stringify({ authenticated: false })]
    );
    return res.json({ok: true});
}

export async function checkMe(req,res) {
    const userId = req.session.userId;

    if (userId){
        const db = getDB();

        const dbRow = await db.get(`
            SELECT name, role FROM users
            WHERE users.id = ?
            `, [userId]);

        return res.json({ok: true, name: dbRow.name, role: dbRow.role});
    }else{
        return res.json({ok: false});
    }
    
}