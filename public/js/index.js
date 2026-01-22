import { getTickets, renderTickets } from './ticket.js';

const loginName = document.getElementById('login-name');
const logoutBtn = document.getElementById('logout-btn');
const loginStatus = document.getElementById('login-status');
const topLoginStatus = document.getElementById('top-login-status');

async function init() {
    try{
        const res = await fetch('/api/auth/me', {credentials: 'include'});
        const data = await res.json();
    
        if (res.ok){
            const name = data.name;
            const role = data.role;
            loginName.textContent = `Welcome ${name} (${role})`;
            logoutBtn.style.display = 'block';
            loginStatus.textContent = 'User logged in';
            topLoginStatus.textContent = 'Logged in';
        } else {
            logoutBtn.style.display = 'none';
            loginStatus.textContent = 'User logged out';
            topLoginStatus.textContent = 'Not logged in';
            loginName.textContent = '';
        }

    } catch (error){
        console.error(error);
    }
    
}
init();
const data = await getTickets();
renderTickets(data);