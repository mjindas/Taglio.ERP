import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "../components/BottomNav";
import Header from "../components/Header";
import AuthWrapper from "@/components/AuthWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Taglio ERP",
  description: "Mobile-first robust ERP solution",
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Prevent zooming to maintain native feel
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-gray-100 dark:bg-black min-h-screen text-gray-900 flex flex-col items-center overflow-x-hidden`}
      >
        <AuthWrapper>
          <div className="w-full max-w-md min-h-screen bg-white dark:bg-zinc-950 shadow-2xl relative flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.1)] dark:shadow-none border-x border-gray-200 dark:border-zinc-900 transition-all duration-300">
            <Header />
            <main className="flex-1 overflow-y-auto pb-24 pt-4 px-4 custom-scrollbar bg-slate-50 dark:bg-zinc-950/50 relative">
              {children}
            </main>
            <BottomNav />
          </div>
        </AuthWrapper>
      </body>
    </html>
  );
}
