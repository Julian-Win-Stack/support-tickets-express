import type { Request, Response, NextFunction } from 'express';

export function authUser(req: Request, res: Response, next: NextFunction): void {
    const userId = req.session?.userId;

    if (!userId){
        res.status(401).json({error: 'User not logged in'});
        return;
    } else if (typeof userId !== 'number' || userId < 1){
        res.status(401).json({error: 'Invalid user id'});
        return;
    } else {
        next();
    }
}