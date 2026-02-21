"use client";
import { CreateTicketSection } from "./components/CreateTicketSection";
import { TicketListingSection } from "./components/TicketListingSection";
import { TicketEditSection } from "./components/TicketEditSection";
import { NoteSection } from "./components/NoteSection";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { getTickets, getTicketById, updateTicket } from "@/lib/api";
import { useRouter } from "next/navigation";
import type { Ticket } from "@/types";

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsShown, setTicketsShown] = useState<number>(0);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [search, setSearch] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<string | null>(null);

  async function refreshTickets(status?: string, search?: string, admin_view_condition?: string) {
    try {
      const data = await getTickets(status ?? '', search ?? '', admin_view_condition ?? '');
      setTickets(data.data);
      setTicketsShown(data.ticketsShown);
    } catch (error) {
      console.error(error);
    }
  }

  async function refreshTicketsAfterEdit() {
    await refreshTickets(status ?? '', search ?? '', assignment ?? '');
    if (selectedTicketId) {
      const data = await getTicketById(selectedTicketId);
      setSelectedTicket(data.data);
    }
  }

  useEffect(() => {
    if (user) {
      refreshTickets(status ?? '', search ?? '', assignment ?? '');
    }
  }, [user, status, search, assignment]);

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
        <CreateTicketSection refreshTickets={refreshTickets} />
        <TicketListingSection
          tickets={tickets}
          ticketsShown={ticketsShown}
          setSelectedTicketId={setSelectedTicketId}
          status={status}
          setStatus={setStatus}
          search={search}
          setSearch={setSearch}
          assignment={assignment}
          setAssignment={setAssignment}
        />
        <TicketEditSection
         selectedTicket={selectedTicket}
         updateTicket={updateTicket}
         refreshTickets={refreshTickets}
         refreshTicketsAfterEdit={refreshTicketsAfterEdit}
         />
        <NoteSection 
        selectedTicket={selectedTicket}
        />
      </div>
    </main>
  );
}
