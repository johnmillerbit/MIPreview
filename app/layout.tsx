import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shop Review",
  description: "A beautiful shop review website",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="max-w-2xl mx-auto py-10 px-4">{children}</main>
      </body>
    </html>
  );
}
