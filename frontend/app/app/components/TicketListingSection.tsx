import { StatusBadge } from "./StatusBadge";

const inputClass =
  "w-full py-2.5 px-3 rounded-[10px] border border-[#263557] bg-[#0f1524] text-[#e8eefc] outline-none placeholder:text-[#98a7cf]";
const labelClass = "text-xs text-[#aab6d6]";
const btnClass =
  "py-2.5 px-3 rounded-[10px] border border-[#2a3b62] bg-[#1c2a47] text-[#e8eefc] cursor-pointer hover:brightness-110 transition-[filter]";

const MOCK_TICKETS = [
  {
    id: 9,
    title: "Bug in login flow",
    status: "resolved" as const,
    name: "Julian Win",
    email: "julianwin@gmail.com",
    created_at: "2026-01-20 17:24:21",
  },
  {
    id: 25,
    title: "Feature request: Dark mode",
    status: "open" as const,
    name: "Julian Win",
    email: "julianwin@gmail.com",
    created_at: "2026-01-21 16:25:00",
  },
  {
    id: 26,
    title: "Payment gateway issue",
    status: "in_progress" as const,
    name: "Julian Win",
    email: "julianwin@gmail.com",
    created_at: "2026-01-21 16:26:08",
  },
];

export function TicketListingSection() {
  return (
    <div className="bg-[#121a2a] border border-[#1e2a44] rounded-[12px] p-4">
      <h2 className="m-0 text-xl font-semibold text-[#e8eefc] mb-3">
        Tickets
      </h2>

      <div className="flex flex-wrap items-end gap-3 mb-3">
        <div className="flex flex-col gap-1.5 min-w-[100px]">
          <label htmlFor="filter-status" className={labelClass}>
            Status
          </label>
          <select id="filter-status" className={inputClass}>
            <option value="">All</option>
            <option value="open">open</option>
            <option value="in_progress">in_progress</option>
            <option value="resolved">resolved</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
          <label htmlFor="filter-search" className={labelClass}>
            Search
          </label>
          <input
            id="filter-search"
            type="text"
            placeholder="Search title/body..."
            className={inputClass}
          />
        </div>
        <button type="button" className={btnClass}>
          Refresh
        </button>
      </div>

      <div className="flex flex-col gap-2.5 mt-3">
        {MOCK_TICKETS.map((ticket) => (
          <article
            key={ticket.id}
            className="p-4 border border-[#243353] rounded-[10px] bg-[#0f1524]"
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex flex-wrap gap-2 items-baseline">
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
            <div className="mt-0.5 text-sm text-[#98a7cf]">
              Created: {ticket.created_at}
            </div>
            <div className="mt-2.5">
              <button type="button" className={`${btnClass} text-sm py-2 px-3`}>
                Open
              </button>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-3 text-sm text-[#98a7cf]">
        Total: 3 (showing 3)
      </p>
    </div>
  );
}
