export type Users ={
    id: number;
    name: string;
    email: string;
    password_hash: string;
    role: string;
    created_at: string;
}

export type Tickets ={
    id: number;
    user_id: number;
    title: string;
    body: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export type Notes ={
    id: number;
    ticket_id: number;
    admin_id: number;
    body: string;
    created_at: string;
}

export type AuditEvents ={
    id: number;
    actor_user_id: number;
    action: string;
    entity_type: string;
    entity_id: number;
    before: string;
    after: string;
    created_at: string;
}

export type Jobs ={
    id: number;
    type: string;
    payload_json: string;
    status: string;
    attempts: number;
    max_attempts: number;
    run_at: string;
    last_error: string;
    created_at: string;
    updated_at: string;
}

export type Notifications ={
    id: number;
    user_id: number;
    channel: string;
    subject: string;
    message: string;
    status: string;
    created_at: string;
}

export type AdminStatusChangePayload ={
    userId: number;
    ticketId: number;
    oldStatus: string;
    newStatus: string;
}

export type TicketAssignedPayload ={
    ticketId: number;
    assignedAdminId: number;
    assignedByAdminId: number;
    oldAssignedAdminId: number | null;
}

export type PayloadUnion = AdminStatusChangePayload | TicketAssignedPayload;