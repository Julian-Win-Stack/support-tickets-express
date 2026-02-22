'use client';

import Link from "next/link";
import { Bell } from "lucide-react";
import { getUnreadNotificationCount } from "@/lib/api";
import { useState, useEffect } from "react";

export function NotificationsButton() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    getUnreadNotificationCount()
      .then((data) => setCount(data.count))
      .catch(() => setCount(0));
    const interval = setInterval(() => {
      getUnreadNotificationCount()
        .then((data) => setCount(data.count))
        .catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link
      href="/notifications"
      aria-label={count > 0 ? `View notifications (${count} unread)` : "View notifications"}
      className="group relative inline-flex p-2 rounded-md mr-2 mt-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7490] focus-visible:ring-offset-2 focus-visible:ring-offset-[#12121C]"
    >
      <Bell className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
      {count > 0 && (
        <span className="absolute -top-3 right-1 min-w-[18px] h-[18px] px-1 text-[11px] rounded-full bg-red-500 text-white flex items-center justify-center">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}