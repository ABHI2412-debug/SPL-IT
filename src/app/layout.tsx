import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SPL/IT · Travel & Group Expense Ledger",
  description: "Shared trip and everyday personal expense ledger with instant NPCI UPI settle-ups.",
  icons: {
    icon: "/images/split-logo.png",
    apple: "/images/split-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

