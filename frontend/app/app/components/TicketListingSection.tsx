"use client";
import { StatusBadge } from "./StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import type { Ticket } from "@/types";

const inputClass =
  "w-full py-2.5 px-3 rounded-[10px] border border-[#263557] bg-[#0f1524] text-[#e8eefc] outline-none placeholder:text-[#98a7cf]";
const labelClass = "text-xs text-[#aab6d6]";
const btnClass =
  "py-2.5 px-3 rounded-[10px] border border-[#2a3b62] bg-[#1c2a47] text-[#e8eefc] cursor-pointer hover:brightness-110 transition-[filter]";


export function TicketListingSection({
  tickets,
  ticketsShown,
  setSelectedTicketId,
  status,
  setStatus,
  search,
  setSearch,
  assignment,
  setAssignment,
}: {
  tickets: Ticket[];
  ticketsShown: number;
  setSelectedTicketId: (ticketId: number) => void;
  status: string | null;
  setStatus: (v: string | null) => void;
  search: string | null;
  setSearch: (v: string | null) => void;
  assignment: string | null;
  setAssignment: (v: string | null) => void;
}) {
  const { user } = useAuth();

  return (
    <div className="bg-[#121a2a] border border-[#1e2a44] rounded-[12px] p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-3">
        <h2 className="m-0 text-lg sm:text-xl font-semibold text-[#e8eefc]">
          Tickets
        </h2>
        {user?.role === 'admin' &&
        <select
          id="filter-assignment"
          value={assignment ?? ''}
          onChange={(e) => {
            setAssignment(e.target.value)
          }}
          className="text-sm py-1.5 px-2.5 rounded-[8px] border border-[#263557] bg-[#0f1524] text-[#e8eefc] outline-none w-full sm:w-auto min-w-0 sm:min-w-[160px]"
        >
          <option value="">Ticket Assignment</option>
          <option 
            value="me"
          >
          My assigned tickets
          </option>
          <option
            value="unassigned"
          >
          Unassigned tickets
          </option>
        </select>
        }
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-end gap-3 mb-3">
        <div className="flex flex-col gap-1.5 w-full sm:w-auto sm:min-w-[100px]">
          <label htmlFor="filter-status" className={labelClass}>
            Status
          </label>
          <select 
            id="filter-status" 
            className={inputClass}
            value={status ?? ''}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All</option>
            <option value="open">open</option>
            <option value="in_progress">in_progress</option>
            <option value="resolved">resolved</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5 flex-1 min-w-0 sm:min-w-[140px]">
          <label htmlFor="filter-search" className={labelClass}>
            Search
          </label>
          <input
            id="filter-search"
            type="text"
            placeholder="Search title/body..."
            className={inputClass}
            value={search ?? ''}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          type="button"
          className={btnClass}
          onClick={() => {
            setStatus(null);
            setSearch(null);
            setAssignment(null);
          }}
          >
          Refresh
        </button>
      </div>

      <div className="flex flex-col gap-2.5 mt-3">
        {tickets.length > 0 ? tickets.map((ticket) => (
          <article
            key={ticket.id}
            className="p-3 sm:p-4 border border-[#243353] rounded-[10px] bg-[#0f1524]"
          >
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-start gap-2">
              <div className="flex flex-wrap gap-2 items-baseline min-w-0">
                <span className="font-mono text-sm font-bold text-[#e8eefc]">
                  #{ticket.id}
                </span>
                <strong className="text-[#e8eefc]">{ticket.title}</strong>
              </div>
              <StatusBadge status={ticket.status} label={ticket.status} />
            </div>
            <div className="mt-1.5 text-sm text-[#98a7cf]">
              Owner: {ticket.name} ({ticket.email})
            </div>
            {user?.role === 'admin' && (
              <div className="mt-0.5 text-sm text-[#98a7cf]">
                {ticket.assigned_admin_name ? `Assigned to: ${ticket.assigned_admin_name}` : "Not assigned"}
              </div>
            )}
            <div className="mt-0.5 text-sm text-[#98a7cf]">
              Created: {ticket.created_at}
            </div>
            <div className="mt-2.5">
              <button 
                type="button" 
                className={`${btnClass} text-sm py-2 px-3`}
                onClick={() => setSelectedTicketId(ticket.id)}
              >
                Open
              </button>
            </div>
          </article>
        )) : (
          <div className="text-sm text-yellow-500 center">
            No tickets found
          </div>
        )}
      </div>

      <p className="mt-3 text-sm text-[#98a7cf]">
        Total: {tickets.length} (showing {ticketsShown})
      </p>
    </div>
  );
}
