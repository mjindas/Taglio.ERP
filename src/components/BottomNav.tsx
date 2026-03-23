"use client";

import { Home, Package, FileText, ShoppingCart, Truck, Boxes, BarChart3 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const links = [
    { name: "Home", href: "/", icon: Home },
    { name: "Masters", href: "/masters", icon: Package },
    { name: "Quotes", href: "/transactions/quotations", icon: FileText },
    { name: "Orders", href: "/transactions/orders", icon: ShoppingCart },
    { name: "Reports", href: "/reports", icon: BarChart3 },
  ];

  return (
    <div className="fixed bottom-0 w-full max-w-md bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 flex justify-between px-2 py-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)] z-50 transition-colors">
      {links.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center w-full px-1 py-1 rounded-xl transition-all duration-300 ${
              isActive
                ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 scale-105"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
            }`}
          >
            <Icon
              className={`w-6 h-6 mb-1 ${
                isActive ? "stroke-[2.5px]" : "stroke-[1.5px]"
              }`}
            />
            <span className="text-[10px] font-semibold">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
