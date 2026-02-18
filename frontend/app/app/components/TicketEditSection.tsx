"use client";

import { useState, useRef, useEffect } from "react";
import { StatusBadge } from "./StatusBadge";

const inputClass =
  "w-full py-2.5 px-3 rounded-[10px] border border-[#263557] bg-[#0f1524] text-[#e8eefc] outline-none placeholder:text-[#98a7cf]";
const labelClass = "text-xs text-[#aab6d6]";
const btnClass =
  "py-2.5 px-3 rounded-[10px] border border-[#2a3b62] bg-[#1c2a47] text-[#e8eefc] cursor-pointer hover:brightness-110 transition-[filter]";
const btnClassSm =
  "text-sm py-1.5 px-2.5 rounded-[8px] border border-[#2a3b62] bg-[#1c2a47] text-[#e8eefc] cursor-pointer hover:brightness-110 transition-[filter]";
const btnClassSelectedSm =
  "text-sm py-1.5 px-2.5 rounded-[8px] border border-[#0e7490] bg-[#0e7490]/30 text-[#e8eefc] cursor-pointer transition-[filter]";

const MOCK_ASSIGNEES = ["admin", "admin2", "Unassigned"];

export function TicketEditSection() {
  const [assignDropdownOpen, setAssignDropdownOpen] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<
    "open" | "in_progress" | "resolved"
  >("open");
  const assignDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        assignDropdownRef.current &&
        !assignDropdownRef.current.contains(e.target as Node)
      ) {
        setAssignDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-[#121a2a] border border-[#1e2a44] rounded-[12px] p-4 max-w-[920px]">
      <h2 className="m-0 text-xl font-semibold text-[#e8eefc] mb-3">
        Ticket Detail
      </h2>

      <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-lg font-bold text-[#e8eefc]">
              Ticket #50
            </span>
            <StatusBadge status="open" label="open" />
          </div>
          <p className="m-0 mt-1 text-sm text-[#98a7cf]">
            Updated: 2026-02-16 16:36:19
          </p>
        </div>
        <div
          className="flex flex-wrap items-center gap-2"
          ref={assignDropdownRef}
        >
          <div className="relative">
            <button
              type="button"
              onClick={() => setAssignDropdownOpen((o) => !o)}
              className={`${btnClassSm} flex items-center gap-1`}
            >
              {selectedAssignee ?? "Assign to..."}
              <span
                className="inline-block w-0 h-0 border-l-[3px] border-r-[3px] border-t-4 border-l-transparent border-r-transparent border-t-current"
                aria-hidden
              />
            </button>
            {assignDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 min-w-[160px] py-1 rounded-[10px] border border-[#243353] bg-[#121a2a] z-10">
                {MOCK_ASSIGNEES.map((name) => (
                  <button
                    key={name}
                    type="button"
                    className="w-full text-left py-2 px-3 text-sm text-[#e8eefc] hover:bg-[#1e2a44]"
                    onClick={() => {
                      setSelectedAssignee(name);
                      setAssignDropdownOpen(false);
                    }}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div
            className="flex flex-wrap gap-1.5"
            role="radiogroup"
            aria-label="Ticket status"
          >
            <button
              type="button"
              role="radio"
              aria-checked={selectedStatus === "resolved"}
              className={
                selectedStatus === "resolved"
                  ? btnClassSelectedSm
                  : btnClassSm
              }
              onClick={() => setSelectedStatus("resolved")}
            >
              Mark resolved
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={selectedStatus === "in_progress"}
              className={
                selectedStatus === "in_progress"
                  ? btnClassSelectedSm
                  : btnClassSm
              }
              onClick={() => setSelectedStatus("in_progress")}
            >
              Set in_progress
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={selectedStatus === "open"}
              className={
                selectedStatus === "open" ? btnClassSelectedSm : btnClassSm
              }
              onClick={() => setSelectedStatus("open")}
            >
              Set open
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="detail-title" className={labelClass}>
            Title
          </label>
          <input
            type="text"
            id="detail-title"
            defaultValue="blah"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="detail-body" className={labelClass}>
            Body
          </label>
          <textarea
            id="detail-body"
            defaultValue="blah"
            rows={4}
            className={`${inputClass} resize-y min-h-[80px]`}
          />
        </div>
        <button type="button" className={`${btnClass} w-full`}>
          Save edits
        </button>
      </div>
    </div>
  );
}
