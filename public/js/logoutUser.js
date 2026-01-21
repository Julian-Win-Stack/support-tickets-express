const logoutBtn = document.getElementById('logout-btn');
const loginStatus = document.getElementById('login-status');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const loginName = document.getElementById('login-name');
const topLoginStatus = document.getElementById('top-login-status');

logoutBtn.addEventListener('click', async()=>{
    console.log('btn clicked')
    logoutBtn.disabled = true;
    loginBtn.disabled = true;
    registerBtn.disabled = true;
    try{
        const res = await fetch('/api/auth/logout',{
            method: 'POST',
            credentials: 'include',
        }

        );

        const data = await res.json();

        if (res.ok){
            loginStatus.textContent = 'User logged out';
            loginName.textContent = '';
            topLoginStatus.textContent = 'Not logged in';
            logoutBtn.style.display = 'none';
        } else {
            loginStatus.textContent = data.error || 'Failed to logout. Please try again.';
        }

    } catch (error){
        console.error(error);
        loginStatus.textContent = 'Unable to connect. Please try again.';

    } finally{
        loginBtn.disabled = false;
        registerBtn.disabled = false;
        logoutBtn.disabled = false;
    }
})