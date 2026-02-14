// when something is being submitted, the button will be disabled.
import { getRole } from './getRole.js';

// DOM (tickets)
const ticketRenderArea = document.getElementById('ticket-render-area');
const ticketCountArea = document.getElementById('ticket-count-area');
const selectStatus = document.getElementById('select-status');
const searchBar = document.getElementById('search-bar');
const refreshBtn = document.getElementById('refresh-btn');
const editTicketBtn = document.getElementById('edit-ticket-btn');
const saveEditStatusEl = document.getElementById('save-edit-status');

// DOM (Notes)
const addNotesStatus = document.getElementById('add-note-status');
const renderNotesArea = document.getElementById('render-notes-area');
const adminNotesSection = document.getElementById('admin-notes-section');
const notesHeading = document.getElementById('notes-heading');
const noteSubmitForm = document.getElementById('note-submit-form');
const addNoteBtn = document.getElementById('add-note-btn');
const assignAdminDropdownTriggerBtn = document.getElementById('assign-admin-dropdown-trigger-btn');
const assignAdminDropdownMenu = document.getElementById('assign-admin-dropdown-menu');
const adminViewDropdownWrapper = document.getElementById('admin-view-dropdown-wrapper');
const adminViewDropdownTriggerBtn = document.getElementById('admin-view-dropdown-trigger-btn');
const adminViewDropdownMenu = document.getElementById('admin-view-dropdown-menu');

// state
let clickedTicketId;
let adminViewCondition = '';


// init
await toggleStatusRadio();
await toggleAssignAdminDropdown();
await toggleAdminViewDropdown();




// 
// 
// eventlistener (editTicket)
// 
// 
editTicketBtn.addEventListener('click', async()=>{
    editTicketBtn.disabled = true;
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
    } finally{
        editTicketBtn.disabled = false;
    }

})



// eventlistener (Select Ticket to edit)
document.addEventListener('click', async(e)=>{
    if (e.target.classList.contains('select-ticket-btns')){
        const clickedBtn = e.target;
        clickedBtn.disabled = true;

        
        try{
            clickedTicketId = e.target.dataset.ticketId;
            if (!Number.isInteger(Number(e.target.dataset.ticketId)) || Number(e.target.dataset.ticketId) <= 0){
                throw new Error ('Invalid ticket id');
            }
    
            if (!clickedTicketId){
                throw new Error ('Select a valid ticket first');
            }
            const res = await fetch(`/api/ticket/${clickedTicketId}`, {credentials: 'include'});
            const data = await res.json();

            if (res.ok){
                document.getElementById('selected-ticket-id').textContent = `Ticket #${data.data.id}`
                document.getElementById('selected-ticket-status').textContent = data.data.status;
                document.getElementById('selected-ticket-upadate-time').textContent = `Updated: ${data.data.updated_at}`
                document.getElementById('ticket-detail-area').style.display = 'block';
                const roleData = await getRole();
                if (roleData.role === 'user'){
                    document.getElementById('selected-ticket-title').value = data.data.title;
                    document.getElementById('selected-ticket-body').value = data.data.body;

                } else if (roleData.role === 'admin'){
                    document.getElementById('admin-view-title').textContent = data.data.title;
                    document.getElementById('admin-view-body').textContent = data.data.body;
                    adminNotesSection.style.display = 'block';
                    const assignLabel = data.data.assigned_admin_name ? `Assigned to: ${data.data.assigned_admin_name}` : 'Assign to...';
                    assignAdminDropdownTriggerBtn.innerHTML = assignLabel + ' <span class="assign-dropdown-chevron"></span>';
                    const noteData = await getNotes();
                    renderNotes(noteData);
                }
            } else{
                throw new Error(data.error || 'Fetch for getTicketById failed!');
            }

        }catch (error){
            document.getElementById('select-ticket-err-msg').textContent = error;
            console.error(error);
        }finally{
            clickedBtn.disabled = false;
        }
    }
})


// Eventlistener Ticket filters
selectStatus.addEventListener('change', eventHandler);

searchBar.addEventListener('input', eventHandler);

refreshBtn.addEventListener('click', ()=>{
    selectStatus.value = '';
    searchBar.value = '';
    adminViewCondition = '';
    adminViewDropdownTriggerBtn.innerHTML = 'View <span class="assign-dropdown-chevron"></span>';
    eventHandler();
})





// Eventlisteners (NOTES)

noteSubmitForm.addEventListener('submit', async(e)=>{
    const addNoteTextarea = document.getElementById('add-note-textarea');
    const body = addNoteTextarea.value;
    addNoteBtn.disabled = true;
    const ticketId = Number(clickedTicketId);
    e.preventDefault();
    try{
        const res = await fetch(`/api/notes/${ticketId}`, {
             method: 'POST',
             headers: {
            'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ body })
        });

        const data = await res.json();

        if (res.ok){
            addNotesStatus.textContent = 'New note created';
            const noteData = await getNotes();
            renderNotes(noteData);

        } else{
            throw new Error (data.error || 'Failed to save note');
        }
    } catch (error){
        addNotesStatus.textContent = error;
        console.error(error);

    } finally{
        addNoteBtn.disabled = false;
        addNoteTextarea.value = '';
    }
})


// Eventlistener (Assign Admin Dropdown)
assignAdminDropdownTriggerBtn.addEventListener('click', async(e)=>{
    
    try{
        assignAdminDropdownTriggerBtn.disabled = true;
        const data = await getAdmins();
        renderAdmins(data);
    } catch (error){
        saveEditStatusEl.textContent = error.message;
        console.error(error);
    } finally{
        assignAdminDropdownTriggerBtn.disabled = false;
    }

})

// Event delegation: when a dropdown item (admin or Unassigned) is clicked, assign the ticket
assignAdminDropdownMenu.addEventListener('click', async (e) => {
    const btn = e.target.closest('.assign-dropdown-item');
    if (!btn) return;

    if (!clickedTicketId) {
        saveEditStatusEl.textContent = 'Select a ticket first';
        return;
    }

    const adminIdRaw = btn.dataset.adminId;
    const adminId = adminIdRaw && adminIdRaw !== '' ? Number(adminIdRaw) : null;
    const adminName = btn.textContent;

    try {
        const res = await fetch(`/api/ticket/${clickedTicketId}/assign`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assigned_admin_id: adminId }),
        });
        const data = await res.json();

        if (res.ok) {
            assignAdminDropdownTriggerBtn.innerHTML = (adminName === 'Unassigned' ? 'Assign to...' : `Assigned to: ${adminName}`) + ' <span class="assign-dropdown-chevron"></span>';
            eventHandler();
            saveEditStatusEl.textContent = 'Assignment updated';
        } else {
            throw new Error(data.error || 'Failed to assign ticket');
        }
    } catch (error) {
        saveEditStatusEl.textContent = error.message;
        console.error(error);
    }
})



// Ticket functions

async function eventHandler(){
    const statusValue = selectStatus.value;
    const searchValue = searchBar.value;
    const data = await getTickets(statusValue, searchValue, adminViewCondition)
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

export async function getTickets(status, search, adminView = '') {
    const fetchEndpointArray = ['/api/ticket'];
    const queryArray = [];
    let finalFetchEndpoint;

    if (status || search || adminView){
        fetchEndpointArray.push('?');
    }

    if (status){
        queryArray.push(`status=${status}`);
    }

    if (search){
        queryArray.push(`search=${search}`);
    }

    if (adminView){
        queryArray.push(`admin_view_condition=${adminView}`);
    }

    if (queryArray.length > 0){
        const finalQueryArray = queryArray.join('&');
        fetchEndpointArray.push(finalQueryArray);
        finalFetchEndpoint = fetchEndpointArray.join('');
    } else {
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








// Notes Functions

async function getNotes() {
    try{
        const res = await fetch(`/api/notes/${clickedTicketId}`, {credentials: 'include'});

        const data = await res.json();

        if (res.ok){
            return data;

        } else{
            throw new Error (data.error || 'Failed to fetch notes.')
        }
    }catch (error){
        addNotesStatus.textContent = error;
        console.error(error);
        return {data: []};
    }
    
}



function renderNotes(data){

    if (data.data.length === 0){
        addNotesStatus.textContent = 'No notes to display for this ticket';
        return;
    }

    let finalCodeString = '';
    data.data.forEach((note)=>{
        finalCodeString += `
            <div class="note">
                <div class="note-top">
                  <strong>${note.name}</strong>
                  <span class="ticket-meta">${note.created_at}</span>
                </div>
                <div>${note.body}</div>
            </div>`
    });
    renderNotesArea.innerHTML = finalCodeString;
    notesHeading.textContent = 'Notes';
}



// Admin Functions

async function toggleAssignAdminDropdown() {
    const data = await getRole();
    const role = data.role;
    if (role === 'admin'){
        document.getElementById('assign-admin-dropdown').style.display = 'block';
    } else {
        document.getElementById('assign-admin-dropdown').style.display = 'none';
    }
}

async function toggleAdminViewDropdown() {
    const data = await getRole();
    const role = data.role;
    if (role === 'admin'){
        adminViewDropdownWrapper.style.display = 'block';
    } else {
        adminViewDropdownWrapper.style.display = 'none';
    }
}

// Event delegation: when admin view dropdown option is clicked, filter tickets
adminViewDropdownMenu.addEventListener('click', async (e) => {
    const btn = e.target.closest('.assign-dropdown-item');
    if (!btn) return;

    const value = btn.dataset.adminView;
    if (!value) return;

    adminViewCondition = value;
    const label = value === 'me' ? 'My assigned tickets' : 'Unassigned tickets';
    adminViewDropdownTriggerBtn.innerHTML = label + ' <span class="assign-dropdown-chevron"></span>';
    eventHandler();
})

async function getAdmins() {
    const res = await fetch('/api/admin/users', {credentials: 'include'});
    const data = await res.json();
    return data;
}

async function renderAdmins(data) {
    const admins = data.data;
    const assignAdminDropdownMenu = document.getElementById('assign-admin-dropdown-menu');
    assignAdminDropdownMenu.innerHTML = '';
    admins.forEach(admin => {
        assignAdminDropdownMenu.innerHTML += `<button type="button" class="assign-dropdown-item" data-admin-id="${admin.id}">${admin.name}</button>`;
    });
    assignAdminDropdownMenu.innerHTML += `<button type="button" class="assign-dropdown-item" data-admin-id="">Unassigned</button>`;
}