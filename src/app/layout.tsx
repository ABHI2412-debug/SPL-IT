import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SPLit",
  description: "A stylized landing experience for SPLit's Trip and Local expense spaces.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

