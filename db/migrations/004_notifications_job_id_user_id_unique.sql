-- Change UNIQUE(job_id) to UNIQUE(job_id, user_id) so one job can notify multiple users.
DROP INDEX IF EXISTS idx_notifications_job_id;
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_job_id_user_id ON notifications(job_id, user_id);