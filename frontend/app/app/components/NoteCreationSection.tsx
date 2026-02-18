const inputClass =
  "w-full py-2.5 px-3 rounded-[10px] border border-[#263557] bg-[#0f1524] text-[#e8eefc] outline-none placeholder:text-[#98a7cf]";
const labelClass = "text-xs text-[#aab6d6]";
const btnClass =
  "py-2.5 px-3 rounded-[10px] border border-[#2a3b62] bg-[#1c2a47] text-[#e8eefc] cursor-pointer hover:brightness-110 transition-[filter]";

export function NoteCreationSection() {
  return (
    <div className="bg-[#121a2a] border border-[#1e2a44] rounded-[12px] p-4 max-w-[920px]">
      <h3 className="m-0 text-base font-medium text-[#e8eefc] mb-3">
        Internal notes (admin only)
      </h3>
      <div className="flex flex-col gap-1.5 mb-2">
        <label htmlFor="add-note" className={labelClass}>
          Add note
        </label>
        <textarea
          id="add-note"
          placeholder="Add internal note..."
          rows={3}
          className={`${inputClass} resize-y min-h-[60px]`}
        />
      </div>
      <button type="button" className={`${btnClass} w-full mb-3`}>
        Add note
      </button>
      <p className="m-0 text-sm text-[#e8b86d]">
        No notes to display for this ticket
      </p>
    </div>
  );
}
