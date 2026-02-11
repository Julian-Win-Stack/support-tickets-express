import express from 'express';
import { createNotes, getNotes } from '../controllers/notesController.js';
import { authUser } from '../middleware/authUser.js'; 
import { requireAdmin } from '../middleware/requireAdmin.js';

export const notesRouter = express.Router();

notesRouter.post('/:ticketId', authUser,requireAdmin, createNotes);
notesRouter.get('/:id',authUser,requireAdmin, getNotes);

