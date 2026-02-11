-- Add job_id to notifications (one notification per job; UNIQUE).
-- SQLite ALTER TABLE cannot add UNIQUE in one step, so we add the column then add a unique index.
-- Column is INTEGER only here so older SQLite works; schema.sql has full REFERENCES for new DBs.

ALTER TABLE notifications ADD COLUMN job_id INTEGER;
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_job_id ON notifications(job_id);
