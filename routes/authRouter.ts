import express from 'express';
import { registerUser, loginUser, logoutUser, checkMe } from '../controllers/authController.js';
import { createRateLimitMiddleware } from '../middleware/rateLimit.js';
export const authRouter = express.Router();

const TEN_MINUTES_MS = 10 * 60 * 1000;

const ONE_HOUR_MS = 60 * 60 * 1000;

const ipLimitMiddleware = createRateLimitMiddleware({
    limiterName: 'login_ip',
    max: 10,
    windowMs: TEN_MINUTES_MS,
    getKey: (req) => req.ip ?? 'unknown',
});

const emailLimitMiddleware = createRateLimitMiddleware({
    limiterName: 'login_email',
    max: 5,
    windowMs: TEN_MINUTES_MS,
    getKey: (req) => (req.body?.loginEmail?.trim().toLowerCase() ?? ''),
});

const registerLimitMiddleware = createRateLimitMiddleware({
    limiterName: 'register',
    max: 5,
    windowMs: ONE_HOUR_MS,
    getKey: (req) => req.ip ?? 'unknown',
});

authRouter.post('/register', registerLimitMiddleware, registerUser);
authRouter.post('/login',ipLimitMiddleware, emailLimitMiddleware, loginUser);
authRouter.post('/logout', logoutUser);
authRouter.get('/me', checkMe);