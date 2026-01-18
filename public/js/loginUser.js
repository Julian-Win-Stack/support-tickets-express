const loginForm = document.getElementById('login-form');
const loginStatus = document.getElementById('login-status');
const loginName = document.getElementById('login-name');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');

loginForm.addEventListener('submit', async(e)=>{
    e.preventDefault();

    const loginEmailRaw = document.getElementById('login-email');
    const loginPasswordRaw = document.getElementById('login-password');

    loginBtn.disabled = true;

    const loginEmail = loginEmailRaw.value.trim();
    const loginPassword = loginPasswordRaw.value;

    try{
        const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials:'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({loginEmail, loginPassword}),
    });

    const data = await res.json();

    if (res.ok){
        loginName.textContent = `Welcome ${data.name}.`;
        loginStatus.textContent = `Login successful`;
        logoutBtn.style.display = 'block';
    }else {
        loginStatus.textContent = data.error || 'Login failed. Please try again.';
    }

    } catch (error){
        console.error(error);
        loginStatus.textContent = 'Unable to connect. Please try again.';
    } finally {
        loginBtn.disabled = false;
        loginEmailRaw.value = '';
        loginPasswordRaw.value = '';
    }
})