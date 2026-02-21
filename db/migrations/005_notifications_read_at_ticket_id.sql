ALTER TABLE notifications ADD COLUMN read_at DATETIME;  
ALTER TABLE notifications ADD COLUMN ticket_id INTEGER REFERENCES tickets(id);
