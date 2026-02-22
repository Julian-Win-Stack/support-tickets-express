"use client";
import { useAuth } from "@/contexts/AuthContext";
import { Note, Ticket } from "@/types";
import { getNotes, createNote } from "@/lib/api";
import { useEffect, useState } from "react";

const inputClass =
  "w-full py-2.5 px-3 rounded-[10px] border border-[#263557] bg-[#0f1524] text-[#e8eefc] outline-none placeholder:text-[#98a7cf]";
const labelClass = "text-xs text-[#aab6d6]";
const btnClass =
  "py-2.5 px-3 rounded-[10px] border border-[#2a3b62] bg-[#1c2a47] text-[#e8eefc] cursor-pointer hover:brightness-110 transition-[filter]";


export function NoteSection({ selectedTicket }: { selectedTicket: Ticket | null }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);


  async function handleAddNote() {
    if (currentNote && selectedTicket) {
      setError(null);
      setSuccessMessage(null);
      try {
        await createNote(selectedTicket.id, currentNote);
        const res = await getNotes(selectedTicket.id);
        setNotes(res.data);
        setCurrentNote(null);
        setSuccessMessage("Note added successfully");
      } catch (error) {
        console.error(error);
        setError("Failed to add note");
      }
    }
  }

  useEffect(() => {
    if (selectedTicket && user && user.role === 'admin') {
      setError(null);
      (async () => {
        const res = await getNotes(selectedTicket.id);
        setNotes(res.data);
      })().catch((error) => {
        console.error(error);
        setNotes([]);
        setError("Failed to get notes");
      });
      setCurrentNote(null);
    }
  }, [selectedTicket]);

  return (
    user && user.role === 'admin' && selectedTicket && (
    <div className="bg-[#121a2a] border border-[#1e2a44] rounded-[12px] p-3 sm:p-4 max-w-[920px]">
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
          value={currentNote ?? ''}
          onChange={(e) => setCurrentNote(e.target.value)}
          rows={3}
          className={`${inputClass} resize-y min-h-[60px]`}
        />
      </div>
      <button 
      type="button" 
      className={`${btnClass} w-full mb-3`}
      onClick={handleAddNote}
      >
        Add note
      </button>
      {successMessage && <p className="m-0 text-sm text-[#e8b86d]">{successMessage}</p>}
      {error && <p className="m-0 text-sm text-[#e8b86d]">{error}</p>}
      <h3 className="m-0 text-base font-medium text-[#e8eefc] mb-2">
        Notes
      </h3>
      {notes.map((note, i) => (
        <div
          key={`${note.created_at}-${i}`}
          className="rounded-[10px] border border-[#1e2a44] bg-[#0f1524] p-3 mb-2"
        >
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-start gap-1 sm:gap-2 mb-1.5">
            <span className="font-semibold text-[#e8eefc]">{note.name}</span>
            <span className="text-sm text-[#98a7cf] shrink-0">{note.created_at}</span>
          </div>
          <p className="m-0 text-sm text-[#e8eefc]">{note.body}</p>
        </div>
      ))}
    </div>
    )
  );
}
