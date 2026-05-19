import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartSplit",
  description: "A stylized landing experience for SmartSplit's Trip and Local expense spaces.",
  manifest: "/manifest.webmanifest",
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
