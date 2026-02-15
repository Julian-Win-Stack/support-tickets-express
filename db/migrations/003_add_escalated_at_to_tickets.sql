ALTER TABLE tickets ADD COLUMN escalated_at DATETIME;
CREATE INDEX IF NOT EXISTS idx_tickets_escalated_at ON tickets(escalated_at);