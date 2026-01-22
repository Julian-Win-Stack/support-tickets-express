export async function getRole() {
    try{
        const res = await fetch('/api/auth/me', {credentials: 'include'});
        const data = await res.json();

        if (res.ok){
            return data;
        } else{
            throw new Error ('User not logged in');
        }
        

    }catch (error){
        console.error(error);
    }
    
}