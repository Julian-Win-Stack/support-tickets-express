import { getTickets, renderTickets } from './ticket&notes.js';



// DOM
const loginName = document.getElementById('login-name');
const logoutBtn = document.getElementById('logout-btn');
const loginStatus = document.getElementById('login-status');
const topLoginStatus = document.getElementById('top-login-status');



// init
document.getElementById('ticket-detail-area').style.display = 'none';
init();
const data = await getTickets();
renderTickets(data);





// functions
async function init() {
    try{
        const res = await fetch('/api/auth/me', {credentials: 'include'});
        const data = await res.json();
    
        if (data.ok){
            const name = data.name;
            const role = data.role;
            loginName.textContent = `Welcome ${name} (${role})`;
            logoutBtn.style.display = 'block';
            loginStatus.textContent = 'User logged in';
            topLoginStatus.textContent = 'Logged in';
            document.body.classList.add('is-logged-in');
        } else {
            logoutBtn.style.display = 'none';
            loginStatus.textContent = 'User logged out';
            topLoginStatus.textContent = 'Not logged in';
            loginName.textContent = '';
            document.body.classList.remove('is-logged-in');
        }

    } catch (error){
        console.error(error);
        document.body.classList.remove('is-logged-in');
    }
    
}
