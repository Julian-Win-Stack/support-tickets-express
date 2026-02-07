export function buildTicketConstraints(role, userId, cleanStatus, cleanSearch) {
   const whereParts = [];
   const userInput = [];

    if (role === 'user'){
        whereParts.push('T.user_id = ?');
        userInput.push(userId);
    }

    if (cleanStatus){
        whereParts.push('T.status = ?');
        userInput.push(cleanStatus);
    }

    if (cleanSearch){
        whereParts.push('(T.title LIKE ? OR T.body LIKE ?)');
        userInput.push(`%${cleanSearch}%`);
        userInput.push(`%${cleanSearch}%`);
    }
    return { whereParts, userInput };
}