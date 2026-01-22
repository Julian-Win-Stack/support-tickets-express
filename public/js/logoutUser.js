const logoutBtn = document.getElementById('logout-btn');
const loginStatus = document.getElementById('login-status');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const loginName = document.getElementById('login-name');
const topLoginStatus = document.getElementById('top-login-status');

logoutBtn.addEventListener('click', async()=>{
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
            window.location.reload();
        } else {
            throw new Error (data.error || 'Failed to logout. Please try again.');
        }

    } catch (error){
        loginStatus.textContent = error;
        console.error(error);

    } finally{
        loginBtn.disabled = false;
        registerBtn.disabled = false;
        logoutBtn.disabled = false;
    }
})