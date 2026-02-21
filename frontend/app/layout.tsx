import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import SessionStatus from "@/app/components/SessionStatus";

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
          <header className="flex flex-row justify-between items-center p-4 w-full">
          <div className="flex-1" />
            <h1 className="text-3xl font-bold shrink-0">Support Tickets</h1>
          <div className="flex-1 flex justify-end">
            <SessionStatus />
            
          </div>
          </header>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
