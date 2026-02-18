"use client";
import { CreateTicketSection } from "./components/CreateTicketSection";
import { TicketListingSection } from "./components/TicketListingSection";
import { TicketEditSection } from "./components/TicketEditSection";
import { NoteCreationSection } from "./components/NoteCreationSection";
import { useAuth } from "@/contexts/AuthContext";
import { redirect } from "next/navigation";

export default function HomePage() {
  const { user } = useAuth();
  if (!user) {
    return redirect('/login');
  }

  return (
    <main className="max-w-[1200px] mx-auto px-4 py-4">
      <div className="w-full max-w-[920px] mx-auto flex flex-col gap-6">
        <CreateTicketSection />
        <TicketListingSection />
        <TicketEditSection />
        <NoteCreationSection />
      </div>
    </main>
  );
}
