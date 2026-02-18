const inputClass =
  "w-full py-2.5 px-3 rounded-[10px] border border-[#263557] bg-[#0f1524] text-[#e8eefc] outline-none placeholder:text-[#98a7cf]";
const labelClass = "text-xs text-[#aab6d6]";
const btnClass =
  "py-2.5 px-3 rounded-[10px] border border-[#2a3b62] bg-[#1c2a47] text-[#e8eefc] cursor-pointer hover:brightness-110 transition-[filter]";

export function CreateTicketSection() {
  return (
    <div className="bg-[#121a2a] border border-[#1e2a44] rounded-[12px] p-4">
      <form className="flex flex-col gap-2.5">
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
            placeholder="Short summary"
            required
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ticket-body" className={labelClass}>
            Body
          </label>
          <textarea
            id="ticket-body"
            name="body"
            placeholder="Describe your issue..."
            required
            rows={4}
            className={`${inputClass} resize-y min-h-[80px]`}
          />
        </div>
        <button type="submit" className={`${btnClass} w-full mt-0.5`}>
          Create
        </button>
      </form>
    </div>
  );
}
