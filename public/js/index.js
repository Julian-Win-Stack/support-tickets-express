const loginName = document.getElementById('login-name');
const logoutBtn = document.getElementById('logout-btn');
const loginStatus = document.getElementById('login-status');

async function init() {
    const res = await fetch('/api/auth/me', {credentials: 'include'});
    const data = await res.json();

    if (res.ok){
        const name = data.name;
        const role = data.role;
        loginName.textContent = `Welcome ${name} (${role})`;
        logoutBtn.style.display = 'block';
        loginStatus.textContent = `User logged in`;
    }
    
}
init()