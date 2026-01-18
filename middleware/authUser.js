export function authUser(req,res,next){
    const userId = req.session.userId;

    if (!userId){
        return res.status(401).json({error: 'User not logged in'});
    }

    next();
}