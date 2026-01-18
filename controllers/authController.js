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
    
        const saltRounds = 10;
    
        const passwordHash = await bcrypt.hash(password, saltRounds);
    
        await db.run(`
            INSERT INTO users (name, email, password_hash)
            VALUES (?, ?, ?)`, [cleanName, cleanEmail, passwordHash]);

    } catch (error){
        console.error(error);
        return res.status(500).json({error: 'Server failed. Please try again.'});
    }

}