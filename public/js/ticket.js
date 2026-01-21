const ticketRenderArea = document.getElementById('ticket-render-area');
const ticketCountArea = document.getElementById('ticket-count-area');
const selectStatus = document.getElementById('select-status');
const searchBar = document.getElementById('search-bar');
const refreshBtn = document.getElementById('refersh-btn');

// set up eventlisteners for selecting status and typing in the search bar
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
                <button class="btn btn-ghost" type="button">Open</button>
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
        console.error(error);
        return {
            data: []
        }
    }
    
}