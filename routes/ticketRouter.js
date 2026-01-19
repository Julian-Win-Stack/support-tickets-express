import express from 'express';
import { createTickets } from '../controllers/ticketController.js';
import { authUser } from '../middleware/authUser.js'; 

export const ticketRouter = express.Router();

ticketRouter.post('/',authUser, createTickets);