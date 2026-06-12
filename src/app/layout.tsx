/**
 * FILE: src/app/layout.tsx
 */

import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "my-q",
  description:
    "Your universal QR identity — share contacts, files, and receive payments from a single scan.",
  openGraph: {
    title: "my-q",
    description: "One QR code. Everything you need to share.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}