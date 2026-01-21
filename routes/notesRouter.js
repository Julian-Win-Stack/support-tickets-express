import express from 'express';
import { createNotes } from '../controllers/notesController.js';
import { authUser } from '../middleware/authUser.js'; 

export const notesRouter = express.Router();

notesRouter.post('/',authUser, createNotes);
// ticketRouter.get('/',authUser, getNotes);

