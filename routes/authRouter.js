import express from 'express';
import { registerUser, loginUser, logoutUser, checkMe } from '../controllers/authController.js';

export const authRouter = express.Router();

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.post('/logout', logoutUser);
authRouter.get('/me', checkMe);