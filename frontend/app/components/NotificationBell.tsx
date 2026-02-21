'use client';

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
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <button className="relative p-2 rounded-md hover:bg-white/10 mr-2 mt-4">
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-3 right-1 min-w-[18px] h-[18px] px-1 text-[11px] rounded-full bg-red-500 text-white flex items-center justify-center">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}