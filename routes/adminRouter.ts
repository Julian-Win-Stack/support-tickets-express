import express from 'express';
import { listJobs, listNotifications, listUsers } from '../controllers/adminController.js';
import { authUser } from '../middleware/authUser.js'; 
import { requireAdmin } from '../middleware/requireAdmin.js';

export const adminRouter = express.Router();

adminRouter.get('/jobs', authUser, requireAdmin, listJobs);
adminRouter.get('/notifications', authUser, requireAdmin, listNotifications);
adminRouter.get('/users', authUser, requireAdmin, listUsers);

// GET /api/admin/notifications is for listing any user’s notifications (admin tooling)