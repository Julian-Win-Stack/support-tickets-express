'use client';
import Link from "next/link";
import { getMyNotifications } from "@/lib/api";
import { useState, useEffect } from "react";
import type { Notification } from "@/types";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    getMyNotifications()
      .then((data) => setNotifications(data.data))
      .catch(() => setNotifications([]));
  }, []);

  return (
    <main className="max-w-[1200px] mx-auto px-4 py-6">
      <div className="w-full max-w-[720px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            type="button"
            className="py-2 px-4 rounded-[10px] border border-[#2a3b62] bg-[#1c2a47] text-[#e8eefc] text-sm font-medium cursor-pointer hover:brightness-110 transition-[filter]"
          >
            Mark all read
          </button>
          <h1 className="text-2xl font-semibold text-[#e8eefc] m-0">
            Notifications
          </h1>
          <div className="w-[100px]" />
        </div>

        <div className="flex flex-col gap-3">
          {notifications.map((n) => {
            const isRead = n.read_at != null;
            return (
            <article
              key={n.id}
              className={`rounded-[12px] border p-4 flex flex-col gap-3 ${
                isRead
                  ? "bg-[#0f1524] border-[#1e2a44]"
                  : "bg-[#1c2a47] border-[#0e7490]"
              }`}
            >
              <h3
                className={`m-0 text-base font-semibold ${
                  isRead ? "text-[#98a7cf]" : "text-[#e8eefc]"
                }`}
              >
                {n.subject}
              </h3>
              <p
                className={`m-0 text-sm ${
                  isRead ? "text-[#7c8ba8]" : "text-[#aab6d6]"
                }`}
              >
                {n.message}
              </p>
              <div className="flex justify-end mt-1">
                <button
                  type="button"
                  className="py-1.5 px-3 rounded-[8px] border border-[#2a3b62] bg-[#121a2a] text-[#aab6d6] text-xs font-medium cursor-pointer hover:brightness-110 transition-[filter]"
                >
                  Mark as read
                </button>
              </div>
            </article>
            );
          })}
        </div>

        <div className="mt-6">
          <Link
            href="/app"
            className="text-sm text-[#0e7490] hover:underline"
          >
            ← Back to tickets
          </Link>
        </div>
      </div>
    </main>
  );
}
