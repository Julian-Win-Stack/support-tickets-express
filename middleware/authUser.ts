import type { Request, Response, NextFunction } from 'express';

export function authUser(req: Request, res: Response, next: NextFunction): void {
    const userId = req.session?.userId;

    if (!userId){
        res.status(401).json({error: 'User not logged in'});
        return;
    }
    next();
}