import express from 'express';
import { listJobs, listNotifications } from '../controllers/adminController.js';
import { authUser } from '../middleware/authUser.js'; 
import { requireAdmin } from '../middleware/requireAdmin.js';

export const adminRouter = express.Router();

adminRouter.get('/jobs', authUser, requireAdmin, listJobs);
adminRouter.get('/notifications', authUser, requireAdmin, listNotifications);
