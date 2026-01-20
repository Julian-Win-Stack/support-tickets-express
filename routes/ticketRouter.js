import express from 'express';
import { createTickets, getTickets, getTicketsById, updateTicketsTitle_Body } from '../controllers/ticketController.js';
import { authUser } from '../middleware/authUser.js'; 

export const ticketRouter = express.Router();

ticketRouter.post('/',authUser, createTickets);
ticketRouter.get('/:id', authUser, getTicketsById);
ticketRouter.get('/',authUser, getTickets);
ticketRouter.patch('/:id', authUser, updateTicketsTitle_Body);


