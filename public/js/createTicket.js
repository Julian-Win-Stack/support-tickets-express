const createTicketForm = document.getElementById('create-ticket-form');
const titleArea = document.getElementById('create-ticket-title-area');
const createTicketBtn = document.getElementById('create-ticket-btn');
const bodyArea = document.getElementById('create-ticket-body-area');
const ticketStatusArea = document.getElementById('create-ticket-status-area');

createTicketForm.addEventListener('submit',async(e)=>{
    createTicketBtn.disabled = true;
    e.preventDefault();
    const title = (titleArea.value).trim();
    const body = (bodyArea.value).trim();
    try{
        const res = await fetch('/api/ticket', {
            method: 'POST', 
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({title, body}),
        });

        const data = await res.json();

        if (res.ok){
            ticketStatusArea.textContent = 'Ticket created';
        } else{
            throw new Error (data.error || 'Action failed. Please try again');
        }

        titleArea.value = '';
        bodyArea.value = '';

    }catch(error){
        ticketStatusArea.textContent = error;
        console.error(error);
    }finally{
        createTicketBtn.disabled = false;    
    }

})