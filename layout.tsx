import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Little Chapters - Heirloom Baby Book",
  description: "One week. One prompt. Ten photos. A book you'll hold forever.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
