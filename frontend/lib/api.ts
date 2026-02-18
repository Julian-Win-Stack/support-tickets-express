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
