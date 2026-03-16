import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import ToastNotifications from "@/components/notifications/ToastNotifications";

export const metadata: Metadata = {
  title: "SHARP — Campus Event Management System",
  description: "Centralized digital platform for managing the complete lifecycle of campus events. Create, discover, register, attend, and earn certificates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
          <ToastNotifications />
        </AuthProvider>
      </body>
    </html>
  );
}
