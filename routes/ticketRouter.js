import express from 'express';
import { createTickets, getTickets } from '../controllers/ticketController.js';
import { authUser } from '../middleware/authUser.js'; 

export const ticketRouter = express.Router();

ticketRouter.post('/',authUser, createTickets);
ticketRouter.get('/',authUser, getTickets);
