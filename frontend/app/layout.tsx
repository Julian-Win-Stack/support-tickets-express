import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationPollingProvider } from "@/contexts/NotificationPollingContext";
import SessionStatus from "@/app/components/SessionStatus";
import GoToTopButton from "@/app/components/GoToTopButton";

export const metadata: Metadata = {
  title: "Support Tickets",
  description: "Support ticket management",
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
            <header className="flex flex-row justify-between items-center p-4 w-full">
              <div className="flex-1" />
              <h1 className="text-3xl font-bold shrink-0">Support Tickets</h1>
              <div className="flex-1 flex justify-end">
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
