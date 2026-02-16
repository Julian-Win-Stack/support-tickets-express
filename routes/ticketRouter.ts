import express from 'express';
import { createTickets, getTickets, getTicketsById, updateTicketsTitle_Body_Status, assignTicket } from '../controllers/ticketController.js';
import { authUser } from '../middleware/authUser.js'; 
import { requireAdmin } from '../middleware/requireAdmin.js';
import { createTicketLimitMiddleware } from '../middleware/rateLimit.js';

export const ticketRouter = express.Router();

ticketRouter.post('/',createTicketLimitMiddleware, authUser, createTickets);
ticketRouter.get('/:id', authUser, getTicketsById);
ticketRouter.get('/',authUser, getTickets);
ticketRouter.patch('/:id/assign', authUser, requireAdmin, assignTicket);
ticketRouter.patch('/:id', authUser, updateTicketsTitle_Body_Status);

 