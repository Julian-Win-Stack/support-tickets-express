// may be remove the DOM names that you used for only once? Organize the DOM. change the names and use El and Input for the const variable names. 
// I added clear admin and user permissions on the lastest frontend endpoints and on :id backend endpoints. 
// show appropriate error messages on the page. 
import { getRole } from './getRole.js';

let clickedTicketId;
const ticketRenderArea = document.getElementById('ticket-render-area');
const ticketCountArea = document.getElementById('ticket-count-area');
const selectStatus = document.getElementById('select-status');
const searchBar = document.getElementById('search-bar');
const refreshBtn = document.getElementById('refersh-btn');
const editTicketBtn = document.getElementById('edit-ticket-btn');
const saveEditStatusEl = document.getElementById('save-edit-status');

// state
await toggleStatusRadio();


// eventlisteners
editTicketBtn.addEventListener('click', async()=>{
    const data = await getRole();
    const selectedRadio = document.querySelector('input[name="ticket-status"]:checked');
    const titleInput = document.getElementById('selected-ticket-title');
    const bodyInput = document.getElementById('selected-ticket-body');
    const title = titleInput.value;
    const body = bodyInput.value;
    
    let sendData = {};

    if (data.role === 'admin'){
        const status = selectedRadio ? selectedRadio.value : '';
        sendData = {status};

    } else if (data.role === 'user'){
        sendData = {title, body};
    }

    try{
        const res = await fetch(`/api/ticket/${clickedTicketId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(sendData)
        });

        const data = await res.json();

        if (res.ok){

            if (data.role === 'user'){
                titleInput.value = data.data.title;
                bodyInput.value = data.data.body;
            } else if (data.role === 'admin'){
                document.getElementById('admin-view-title').textContent = data.data.title;
                document.getElementById('admin-view-body').textContent = data.data.body;
            }
            
            document.getElementById('selected-ticket-status').textContent = data.data.status;
            document.getElementById('selected-ticket-upadate-time').textContent = data.data.updated_at;
            eventHandler();
            saveEditStatusEl.textContent = 'Edits saved';

        } else {
            throw new Error (data.error || 'Fetch for updating ticket failed!');
        }

    }catch (error){
        saveEditStatusEl.textContent = error;
        console.error(error);
    }

})


document.addEventListener('click', async(e)=>{
    if (e.target.classList.contains('select-ticket-btns')){
        try{
            clickedTicketId = e.target.dataset.ticketId;
            const res = await fetch(`/api/ticket/${clickedTicketId}`, {credentials: 'include'});
            const data = await res.json();

            if (res.ok){
                document.getElementById('selected-ticket-id').textContent = `Ticket #${data.data.id}`
                document.getElementById('selected-ticket-status').textContent = data.data.status;
                document.getElementById('selected-ticket-upadate-time').textContent = `Updated: ${data.data.updated_at}`

                const roleData = await getRole();
                if (roleData.role === 'user'){
                    document.getElementById('selected-ticket-title').value = data.data.title;
                    document.getElementById('selected-ticket-body').value = data.data.body;

                } else if (roleData.role === 'admin'){
                    document.getElementById('admin-view-title').textContent = data.data.title;
                    document.getElementById('admin-view-body').textContent = data.data.body;

                }
            } else{
                throw new Error(data.error || 'Fetch for getTicketById failed!');
            }

        }catch (error){
            document.getElementById('select-ticket-err-msg').textContent = error;
            console.error(error);
        }
    }
})

selectStatus.addEventListener('change', eventHandler);

searchBar.addEventListener('input', eventHandler);

refreshBtn.addEventListener('click', ()=>{
    selectStatus.value = '';
    searchBar.value = '';
    eventHandler();
})





// functions

async function eventHandler(){
    const statusValue = selectStatus.value;
    const searchValue = searchBar.value;
    const data = await getTickets(statusValue, searchValue)
    renderTickets(data)
}

export function renderTickets(data) {
    let finalString = '';

    if (data){
        data.data.forEach(ticket => {
            finalString += `          
            <article class="ticket">
              <div class="ticket-top">
                <div class="ticket-title">
                  <span class="mono">#${ticket.id}</span>
                  <strong>${ticket.title}</strong>
                </div>
                <span class="badge">${ticket.status}</span>
              </div>
              <div class="ticket-meta">Owner: ${ticket.name} (${ticket.email})</div>
              <div class="ticket-meta">Created: ${ticket.created_at}</div>
              <div class="ticket-actions">
                <button class="btn btn-ghost select-ticket-btns" type="button" data-ticket-id="${ticket.id}">Open</button>
              </div>
            </article>`
        });

        ticketRenderArea.innerHTML = finalString;
    }
    ticketCountArea.textContent = `Total: ${data.ticketsShown} (showing ${data.totalTicket})`;

}

export async function getTickets(status, search) {
    const fetchEndpointArray = ['/api/ticket'];
    const queryArray = [];
    let finalFetchEndpoint;

    if (status || search){
        fetchEndpointArray.push('?');
    }

    if (status){
        queryArray.push(`status=${status}`);
    }

    if (search){
        queryArray.push(`search=${search}`);
    }

    if (queryArray.length === 1){
        fetchEndpointArray.push(queryArray[0]);
        finalFetchEndpoint = fetchEndpointArray.join('');

    }else if (queryArray.length === 2){
        const finalQueryArray = queryArray.join('&');
        fetchEndpointArray.push(finalQueryArray);
        finalFetchEndpoint = fetchEndpointArray.join('');

    }else {
        finalFetchEndpoint = fetchEndpointArray[0];
    }

    try{
        const res = await fetch(finalFetchEndpoint, {credentials: 'include'});

        const data = await res.json();

        if (!res.ok){
            throw new Error(data.error || 'Failed to fetch tickets');
        }
        return data

    } catch (error){
        document.getElementById('filter-tickets-error').textContent = error;
        console.error(error);
        return {
            data: []
        }
    }
}

async function toggleStatusRadio() {
    const data = await getRole();
    const role = data.role;

    if (role === 'user'){
        document.getElementById('status-radios').style.display = 'none';
        document.getElementById('edit-admin-area').style.display = 'none';
    } else if (role === 'admin'){
        document.getElementById('edit-user-area').style.display = 'none';
    }
}

