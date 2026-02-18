"use client";
import { createTicket } from "@/lib/api";
import { useState } from "react";

const inputClass =
  "w-full py-2.5 px-3 rounded-[10px] border border-[#263557] bg-[#0f1524] text-[#e8eefc] outline-none placeholder:text-[#98a7cf]";
const labelClass = "text-xs text-[#aab6d6]";
const btnClass =
  "py-2.5 px-3 rounded-[10px] border border-[#2a3b62] bg-[#1c2a47] text-[#e8eefc] cursor-pointer hover:brightness-110 transition-[filter]";

export function CreateTicketSection({ updateTickets }: { updateTickets: () => void }) {
  const [title, setTitle] = useState<string | null>(null);
  const [body, setBody] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleCreateTicket(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    try {
      const data = await createTicket(title ?? '', body ?? '');
      if (data.ok) {
        setTitle('');
        setBody('');
        setSuccessMessage('Ticket created successfully');
        updateTickets();
      } else {
        setError(data.error || 'Failed to create ticket');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create ticket');
    }
  }

  return (
    <div className="bg-[#121a2a] border border-[#1e2a44] rounded-[12px] p-4">
      <form className="flex flex-col gap-2.5" onSubmit={handleCreateTicket}>
        <h2 className="m-0 text-base font-medium text-[#e8eefc] mb-1">
          Create Ticket
        </h2>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ticket-title" className={labelClass}>
            Title
          </label>
          <input
            type="text"
            id="ticket-title"
            name="title"
            value={title ?? ''}
            placeholder="Short summary"
            required
            className={inputClass}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ticket-body" className={labelClass}>
            Body
          </label>
          <textarea
            id="ticket-body"
            name="body"
            value={body ?? ''}
            placeholder="Describe your issue..."
            required
            rows={4}
            className={`${inputClass} resize-y min-h-[80px]`}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
        <button type="submit" className={`${btnClass} w-full mt-0.5`}>
          Create
        </button>
      </form>
      <p className="text-sm text-yellow-500 mt-4 mb-2">{error}</p>
      <p className="text-sm text-yellow-500 mt-4 mb-2">{successMessage}</p>
    </div>
  );
}
