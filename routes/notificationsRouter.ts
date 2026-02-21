import express from 'express';
import {
    listMyNotifications,
    getUnreadCount,
    readOneNotification,
    unReadOneNotification,
    markAllNotificationsRead,
} from '../controllers/notificationsController.js';
import { authUser } from '../middleware/authUser.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

export const notificationsRouter = express.Router();

// Specific routes first (before /:id)
notificationsRouter.get('/unread-count', authUser, requireAdmin, getUnreadCount);
notificationsRouter.patch('/read-all', authUser, requireAdmin, markAllNotificationsRead);

notificationsRouter.get('/', authUser, requireAdmin, listMyNotifications);
notificationsRouter.patch('/:id/read', authUser, requireAdmin, readOneNotification);
notificationsRouter.patch('/:id/unread', authUser, requireAdmin, unReadOneNotification);
