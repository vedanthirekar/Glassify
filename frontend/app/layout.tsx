import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/context/SessionContext";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MindGate",
  description: "Your AI conscience for mindful social media use",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.className}>
      <body className="bg-gray-950 min-h-screen antialiased" suppressHydrationWarning>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
