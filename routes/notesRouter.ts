import express from 'express';
import { createNotes, getNotes } from '../controllers/notesController.js';
import { authUser } from '../middleware/authUser.js'; 

export const notesRouter = express.Router();

notesRouter.post('/',authUser, createNotes);
notesRouter.get('/:id',authUser, getNotes);

