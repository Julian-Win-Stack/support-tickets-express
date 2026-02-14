ALTER TABLE tickets ADD COLUMN assigned_admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_admin ON tickets(assigned_admin_id);
