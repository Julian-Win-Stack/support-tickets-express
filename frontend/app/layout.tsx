import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationPollingProvider } from "@/contexts/NotificationPollingContext";
import SessionStatus from "@/app/components/SessionStatus";
import GoToTopButton from "@/app/components/GoToTopButton";

export const metadata: Metadata = {
  title: "Support Tickets",
  description: "Support ticket management",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <NotificationPollingProvider>
            <header className="flex flex-row justify-between items-center px-3 py-3 sm:px-4 sm:py-4 w-full gap-2 sm:gap-4">
              <div className="flex-1 min-w-0" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold shrink-0 truncate">
                Support Tickets
              </h1>
              <div className="flex-1 flex justify-end min-w-0">
                <SessionStatus />
              </div>
            </header>
            {children}
            <GoToTopButton />
          </NotificationPollingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
