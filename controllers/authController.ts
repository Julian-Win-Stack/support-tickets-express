import bcrypt from 'bcrypt';
import { getDB } from '../db/db.js';
import type { Request, Response } from 'express';

type RegisterUserBody = {
    registerName?: string;
    registerEmail?: string;
    registerPassword?: string;
}

type LoginUserBody = {
    loginEmail?: string;
    loginPassword?: string;
}

export async function registerUser(req: Request, res: Response): Promise<void> {
    try{
        const db = getDB();
        const { registerName = '', registerEmail = '', registerPassword = '' } = req.body as RegisterUserBody;
    
        const cleanName = registerName.trim();
        const cleanEmail = registerEmail.trim().toLowerCase();
    
        if (!cleanName || !cleanEmail || !registerPassword){
            res.status(400).json({error: 'Missing input fields'});
            return;
        }

        const isEmailDuplicate = await db.get(`
            SELECT id FROM users 
            WHERE email = ?
            `, [cleanEmail]);

        if (isEmailDuplicate){
            res.status(400).json({error: 'Duplicate Email'});
            return;
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

        res.status(201).json({ok: true})
        return;

        } catch (error){
        console.error(error);
        res.status(500).json({error: 'Server failed. Please try again.'});
        return;
    }
}
type LoginUserDbRow = {
    password_hash: string;
    id: number;
    name: string;
    role: string;
}
export async function loginUser(req: Request, res: Response): Promise<void> {
    try{
        const db = getDB();
        const { loginEmail = '', loginPassword = '' } = req.body as LoginUserBody;
    
        const cleanEmail = loginEmail.trim().toLowerCase();
    
        if (!cleanEmail || !loginPassword){
            res.status(400).json({error: 'Missing input fields'});
            return;
        }

        const dbRow : LoginUserDbRow | undefined = await db.get(`
            SELECT password_hash, id, name, role FROM users 
            WHERE email = ?
            `, [cleanEmail]);

        if (!dbRow){
            res.status(400).json({error: 'Incorrect email'});
            return;
        }

        const dbPasswordHash = dbRow.password_hash;

        const isPasswordMatch = await bcrypt.compare(loginPassword, dbPasswordHash);

        if (!isPasswordMatch){
            res.status(400).json({error: 'Incorrect password'});
            return;
        }

        req.session.regenerate(async (error)=>{
            if (error){
                console.error(error);
                res.status(500).json({error: 'Login failed. Please try again.'});
                return;
            }
            req.session.userId = dbRow.id;

            await db.run(
                `INSERT INTO audit_events (actor_user_id, action, entity_type, entity_id, after)
                VALUES (?, ?, ?, ?, ?)
                `, [dbRow.id, 'user_logged_in', 'user', dbRow.id, JSON.stringify({ authenticated: true })]
            );
            
            res.json({ok: true, name: dbRow.name, role: dbRow.role});
            return;
        });


    }catch (error){
        console.error(error);
        res.status(500).json({error: 'Server failed. Please try again.'});
        return;
    }
    
}

export async function logoutUser(req: Request, res: Response): Promise<void> {

    if (!req.session){
        res.json({ok: true});
        return;
    }
    const userId = req.session.userId;

    req.session.destroy( async (error)=>{
        if (error){
            console.error(error);
            res.status(500).json({error: 'User failed to logout. Please try again.'});
            return;
        }
        res.clearCookie('sid');

        try {
        const db = getDB();
        await db.run(
            `INSERT INTO audit_events (actor_user_id, action, entity_type, entity_id, after)
            VALUES (?, ?, ?, ?, ?)
            `, [userId, 'user_logged_out', 'user', userId, JSON.stringify({ authenticated: false })]
        );

        } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'User failed to logout. Please try again.' });
        return;
        }
        
        res.json({ ok: true });
        return;
        });
}
type CheckMeDbRow = {
    name: string;
    role: string;
}
export async function checkMe(req: Request, res: Response): Promise<void> {
    const userId = req.session.userId;

    if (userId){
        const db = getDB();

        const dbRow : CheckMeDbRow | undefined = await db.get(`
            SELECT name, role FROM users
            WHERE users.id = ?
            `, [userId]);

        if (!dbRow){
            res.json({ok: false});
            return;
        }

        res.json({ok: true, name: dbRow.name, role: dbRow.role});
        return;
    }else{
        res.json({ok: false});
        return;
    }
    
}