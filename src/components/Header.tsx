"use client";

import { Bell, Menu, ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const isHome = pathname === "/";
  // Convert path like "/masters/clients" to "Clients Master"
  let title = "Taglio ERP";
  if (!isHome) {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length > 0) {
      if (parts[parts.length - 1] === "create") {
        title = `New ${parts[0]}`;
      } else {
        title = parts[parts.length - 1].replace(/-/g, " ");
        if (parts[0] === "masters") title += " Master";
      }
    }
  }

  return (
    <div className="sticky top-0 z-50 w-full max-w-md mx-auto bg-white/80 dark:bg-zinc-950/80 backdrop-blur-lg border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-4 py-3 h-16 shadow-sm transition-colors pt-safe">
      <div className="flex items-center gap-3">
        {!isHome && (
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition text-gray-700 dark:text-gray-300"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        {isHome && (
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
            T
          </div>
        )}
        <h1 className="text-xl font-semibold capitalize tracking-tight text-gray-900 dark:text-gray-100 line-clamp-1">
          {title}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition text-gray-500 dark:text-gray-400 relative">
          <Bell className="w-6 h-6" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950"></span>
        </button>
        {isHome && (
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition text-gray-500 dark:text-gray-400">
            <Menu className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}
