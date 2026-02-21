export type TicketStatus = "open" | "in_progress" | "resolved";

export type Note = {
  created_at: string;
  body: string;
  name: string;
};

export type Ticket = {
  id: number;
  user_id: number;
  title: string;
  body: string;
  status: TicketStatus;
  name?: string;
  email: string;
  created_at: string;
  updated_at: string;
  assigned_admin_id: number | null;
  escalated_at: string | null;
  assigned_admin_name?: string | null;
};

export type AuthUser = {
  name: string;
  role: string;
};

export type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginError: string | null;
  registerError: string | null;
  loginSuccessMessage: string | null;
  registerSuccessMessage: string | null;
};

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};
