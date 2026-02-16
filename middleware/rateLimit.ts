import type { Request, Response, NextFunction } from 'express';
import { createRateLimitStore } from '../lib/rateLimitStore.js';

const store = createRateLimitStore();

export function createTicketLimitMiddleware(req: Request, res: Response, next: NextFunction) {
    if (req.session?.userId) {
        const key = 'ticket_user';
        const fullKey = `${key}:${req.session.userId}`;
        const ONE_HOUR_MS = 60 * 60 * 1000;
        const result = store.check(fullKey, 10, ONE_HOUR_MS);
        if (result.blocked) {
            res.status(429).json({
                ok: false,
                error: 'Too Many Requests',
                retryAfterSeconds: result.retryAfterSeconds,
            });
            return
        }
    } else {
        const key = 'ticket_guest';
        const fullKey = `${key}:${req.ip}`;
        const ONE_HOUR_MS = 60 * 60 * 1000;
        const result = store.check(fullKey, 30, ONE_HOUR_MS);
        if (result.blocked) {
            res.status(429).json({
                ok: false,
                error: 'Too Many Requests',
                retryAfterSeconds: result.retryAfterSeconds,
            });
            return;
        }
    }
    next();
}

export function createRateLimitMiddleware(options: {
    limiterName: string;
    max: number;
    windowMs: number;
    getKey: (req: Request) => string;
}) {
    const { limiterName, max, windowMs, getKey } = options;

    return function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
        const key = getKey(req);
        const fullKey = `${limiterName}:${key}`;
        const result = store.check(fullKey, max, windowMs);

        if (result.blocked) {
            res.status(429).json({
                ok: false,
                error: 'Too Many Requests',
                retryAfterSeconds: result.retryAfterSeconds,
            });
            return;
        }

        next();
    }

};
export function resetRateLimitStore() {
    store.reset();
}
