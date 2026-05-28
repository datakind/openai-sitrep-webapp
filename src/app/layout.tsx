import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Executive Summary",
  description: "Summarize multiple uploaded files into one executive brief."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
