"use client";
import { CreateTicketSection } from "./components/CreateTicketSection";
import { TicketListingSection } from "./components/TicketListingSection";
import { TicketEditSection } from "./components/TicketEditSection";
import { NoteCreationSection } from "./components/NoteCreationSection";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { getTickets, getTicketById } from "@/lib/api";
import { useRouter } from "next/navigation";
import type { Ticket } from "@/types";

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsShown, setTicketsShown] = useState<number>(0);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

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

  useEffect(() => {
    if (selectedTicketId) {
      getTicketById(selectedTicketId).then((data) => {
        setSelectedTicket(data.data);
      });
    }
  }, [selectedTicketId]);

  return (
    <main className="max-w-[1200px] mx-auto px-4 py-4">
      <div className="w-full max-w-[920px] mx-auto flex flex-col gap-6">
        <CreateTicketSection updateTickets={updateTickets} />
        <TicketListingSection 
          tickets={tickets} 
          ticketsShown={ticketsShown} 
          updateTickets={updateTickets} 
          setSelectedTicketId={setSelectedTicketId} 
        />
        <TicketEditSection selectedTicket={selectedTicket} />
        <NoteCreationSection />
      </div>
    </main>
  );
}
