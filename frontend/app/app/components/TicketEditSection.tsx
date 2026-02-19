"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "./StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { getAdmins } from "@/lib/api";
import type { AdminUser, Ticket } from "@/types";

const inputClass =
  "w-full py-2.5 px-3 rounded-[10px] border border-[#263557] bg-[#0f1524] text-[#e8eefc] outline-none placeholder:text-[#98a7cf]";
const labelClass = "text-xs text-[#aab6d6]";
const btnClass =
  "py-2.5 px-3 rounded-[10px] border border-[#2a3b62] bg-[#1c2a47] text-[#e8eefc] cursor-pointer hover:brightness-110 transition-[filter]";
const btnClassSm =
  "text-sm py-1.5 px-2.5 rounded-[8px] border border-[#2a3b62] bg-[#1c2a47] text-[#e8eefc] cursor-pointer hover:brightness-110 transition-[filter]";
const btnClassSelectedSm =
  "text-sm py-1.5 px-2.5 rounded-[8px] border border-[#0e7490] bg-[#0e7490]/30 text-[#e8eefc] cursor-pointer transition-[filter]";

export function TicketEditSection({ selectedTicket }: { selectedTicket: Ticket | null }) {
  const { user } = useAuth();
  const [selectedAssignee, setSelectedAssignee] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<
    "open" | "in_progress" | "resolved"
  >("open");
  const [title, setTitle] = useState<string>("");
  const [body, setBody] = useState<string>("");
  const [admins, setAdmins] = useState<AdminUser[]>([]);

  useEffect(() => {
    setAdmins([]);
    if (user?.role === 'admin') {
      getAdmins().then((data) => {
        setAdmins(data.data);
      });
    }
  }, [user]);

  useEffect(() => {
    if (selectedTicket) {
      setSelectedAssignee(selectedTicket.assigned_admin_id ? String(selectedTicket.assigned_admin_id) : "");
      setSelectedStatus(selectedTicket.status);
      setTitle(selectedTicket.title);
      setBody(selectedTicket.body);
    }
  }, [selectedTicket]);

  return (
    selectedTicket && (
    <div className="bg-[#121a2a] border border-[#1e2a44] rounded-[12px] p-4 max-w-[920px]">
      <h2 className="m-0 text-xl font-semibold text-[#e8eefc] mb-3">
        Ticket Detail
      </h2>

      <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-lg font-bold text-[#e8eefc]">
              Ticket #{selectedTicket.id}
            </span>
            <StatusBadge status={selectedTicket.status} label={selectedTicket.status} />
          </div>
          <p className="m-0 mt-1 text-sm text-[#98a7cf]">
            Updated: {selectedTicket.updated_at}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {user?.role === "admin" && (
            <>
              <select
                id="assign-ticket"
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="text-sm py-1.5 px-2.5 rounded-[8px] border border-[#263557] bg-[#0f1524] text-[#e8eefc] outline-none min-w-[160px]"
              >
                <option value="">Assign to...</option>
                {admins.length > 0 && admins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.name}
                  </option>
                ))}
              </select>
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
            </>
          )}
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            disabled={user?.role === 'admin'}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="detail-body" className={labelClass}>
            Body
          </label>
          <textarea
            id="detail-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className={`${inputClass} resize-y min-h-[80px]`}
            disabled={user?.role === 'admin'}
          />
        </div>
        <button type="button" className={`${btnClass} w-full`}>
          Save edits
        </button>
      </div>
    </div>
    )
  );
}
