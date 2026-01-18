import bcrypt from 'bcrypt';
import { getDBConnection } from '../db/db.js';

export async function registerUser(req,res) {
    try{
        const db = await getDBConnection();
        const { name = '', email = '', password = '' } = req.body;
    
        const cleanName = name.trim();
        const cleanEmail = email.trim();
    
        if (!cleanName || !cleanEmail || !password){
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
    
        const passwordHash = await bcrypt.hash(password, saltRounds);
    
        await db.run(`
            INSERT INTO users (name, email, password_hash)
            VALUES (?, ?, ?)
            `, [cleanName, cleanEmail, passwordHash]);

    } catch (error){
        console.error(error);
        return res.status(500).json({error: 'Server failed. Please try again.'});
    }
}

export async function loginUser(req,res) {
    try{
        const db = await getDBConnection();
        const { email = '', incomingPassword = '' } = req.body;
    
        const cleanEmail = email.trim();
    
        if (!cleanEmail || !incomingPassword){
            return res.status(400).json({error: 'Missing input fields'});
        }

        const dbRow = await db.get(`
            SELECT password_hash, id FROM users 
            WHERE email = ?
            `, [cleanEmail]);

        if (!dbRow){
            return res.status(400).json({error: 'Incorrect email'});
        }

        const dbPasswordHash = dbRow.password_hash;

        const isPasswordMatch = await bcrypt.compare(incomingPassword, dbPasswordHash);

        if (!isPasswordMatch){
            return res.status(400).json({error: 'Incorrect password'});
        }

        req.session.userId = dbRow.id;

    }catch (error){
        console.error(error);
        return res.status(500).json({error: 'Server failed. Please try again.'});
    }
    
}