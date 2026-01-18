const registerForm = document.getElementById('register-form');
const registerBtn = document.getElementById('register-btn');
const registerMessage = document.getElementById('register-message');

registerForm.addEventListener('submit', async(e)=>{
    e.preventDefault();

    const registerNameRaw = document.getElementById('register-name');
    const registerEmailRaw = document.getElementById('register-email');
    const registerPasswordRaw = document.getElementById('register-password');

    const registerName = registerNameRaw.value.trim();
    const registerEmail = registerEmailRaw.value.trim();
    const registerPassword = registerPasswordRaw.value.trim();

    registerMessage.textContent = '';
    registerBtn.disabled = true;
    
    try{
    const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({registerName, registerEmail, registerPassword}),
    });

    const data = await res.json();

    if (!res.ok){
        registerMessage.textContent = data.error || 'Registration failed. Please try again.';
    } else {
        registerMessage.textContent = 'Registration succeed';
    }

    registerNameRaw.value = '';
    registerEmailRaw.value = '';
    registerPasswordRaw.value = '';


    }catch (error){
        console.error(error);
        registerMessage.textContent = 'Unable to connect. Please try again. '
    }finally{
        registerBtn.disabled = false;
    }

})
























// ============================
// Tickets API
// ============================





// ============================
// UI helpers
// ============================



// ============================
// Event handlers
// ============================



// ============================
// App bootstrap
// ============================
