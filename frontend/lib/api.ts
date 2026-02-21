const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function login(loginEmail: string, loginPassword: string) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ loginEmail, loginPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  return data;
}

export async function me() {
  const res = await fetch(`${API_URL}/api/auth/me`, { credentials: "include" });
  const data = await res.json();
  return data; // { ok, name, role } or { ok: false }
}

export async function logout() {
  const res = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Logout failed");
  return data;
}

export async function register(
  registerName: string,
  registerEmail: string,
  registerPassword: string
) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      registerName,
      registerEmail,
      registerPassword,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Registration failed");
  return data;
}

export async function createTicket(title: string, body: string) {
  const res = await fetch(`${API_URL}/api/ticket`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, body }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Ticket creation failed");
  return data;
}

export async function getTickets(status?: string, search?: string, admin_view_condition?: string) {

  const queryParams = [];
  if (status) {
    queryParams.push(`status=${status}`);
  }
  if (search) {
    queryParams.push(`search=${search}`);
  }

  if (admin_view_condition) {
    queryParams.push(`admin_view_condition=${admin_view_condition}`);
  }
  const finalQueryString = queryParams.length > 1 ? `?${queryParams.join('&')}` : queryParams.length === 1 ? `?${queryParams[0]}` : '';
  const res = await fetch(`${API_URL}/api/ticket${finalQueryString}`, { credentials: "include" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to get tickets");
  return data;
}

export async function getTicketById(ticketId: number) {
  const res = await fetch(`${API_URL}/api/ticket/${ticketId}`, { credentials: "include" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to get ticket");
  return data;
}

export async function getAdmins() {
  const res = await fetch(`${API_URL}/api/admin/users`, { credentials: "include" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to get admins");
  return data;
}

export async function assignTicket(ticketId: number, assignedAdminId: number | null) {
  const assigned_admin_id = assignedAdminId ?? null;
  const res = await fetch(`${API_URL}/api/ticket/${ticketId}/assign`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assigned_admin_id }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to assign ticket");
  console.log('ticket assigned. data', data);
  return data;
}

export async function updateTicket(ticketId: number, title: string = "", body: string = "", status: string = "") {
  const res = await fetch(`${API_URL}/api/ticket/${ticketId}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, body, status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to update ticket");
  return data;
}

export async function getNotes(ticketId: number) {
  const res = await fetch(`${API_URL}/api/notes/${ticketId}`, { credentials: "include" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to get notes");
  return data;
}

export async function createNote(ticketId: number, body: string) {
  const res = await fetch(`${API_URL}/api/notes/${ticketId}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create note");
  return data;
}


export async function getMyNotifications() {
  const res = await fetch(`${API_URL}/api/notifications`, { credentials: "include" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to get notifications");
  return data;
}


export async function getUnreadNotificationCount() {
  const res = await fetch(`${API_URL}/api/notifications/unread-count`, { credentials: "include" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to get unread notification count");
  return data;
}

export async function markOneNotificationRead(notificationId: number) {
  const res = await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
    method: "PATCH",
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to mark notification as read");
  return data;
}

export async function markAllNotificationsRead() {
  const res = await fetch(`${API_URL}/api/notifications/read-all`, {
    method: "PATCH",
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to mark all notifications as read");
  return data;
}


