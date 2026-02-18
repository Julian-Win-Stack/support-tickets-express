"use client";
import { CreateTicketSection } from "./components/CreateTicketSection";
import { TicketListingSection } from "./components/TicketListingSection";
import { TicketEditSection } from "./components/TicketEditSection";
import { NoteCreationSection } from "./components/NoteCreationSection";
import { useAuth } from "@/contexts/AuthContext";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { getTickets } from "@/lib/api";
import { useRouter } from "next/navigation";

export type Ticket = {
  id: number;
  user_id: number;
  title: string;
  body: string;
  status: "open" | "in_progress" | "resolved";
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  assigned_admin_id: number | null;
  escalated_at: string | null;
  assigned_admin_name?: string | null;
}

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsShown, setTicketsShown] = useState<number>(0);

  async function updateTickets(status?: string, search?: string, admin_view_condition?: string) {
    try {
      const data = await getTickets(status ?? '', search ?? '', admin_view_condition ?? '');
      setTickets(data.data);
      setTicketsShown(data.ticketsShown);
    } catch (error) {
      console.error(error);
    }
  }
  

  useEffect(() => {
    if (user) {
      updateTickets();
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user]);

  return (
    <main className="max-w-[1200px] mx-auto px-4 py-4">
      <div className="w-full max-w-[920px] mx-auto flex flex-col gap-6">
        <CreateTicketSection updateTickets={updateTickets} />
        <TicketListingSection tickets={tickets} ticketsShown={ticketsShown} updateTickets={updateTickets} />
        <TicketEditSection />
        <NoteCreationSection />
      </div>
    </main>
  );
}
