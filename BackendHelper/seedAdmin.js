import bcrypt from 'bcrypt';
import { getDBConnection } from '../db/db.js';

try{
    const password = 'admin2';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const db = await getDBConnection();
    
    
     db.run(
        `INSERT INTO users (name, email, password_hash, role)
        VALUES ('admin2', 'admin2@gmail.com', '${hashedPassword}', 'admin')`
    )

}catch (error){
    console.error(error);
}



