"use client";

import Link from "next/link";
import { Users, FolderTree, Package, ArrowRight, Truck, UserCog, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "@/store/useStore";

export default function MastersIndex() {
  const { user } = useStore();

  const masters = [
    { name: "Client Master",   desc: "Manage your clients and their details",   href: "/masters/clients",    icon: Users,      color: "text-blue-500",    bg: "bg-blue-50 dark:bg-blue-500/10" },
    { name: "Supplier Master", desc: "Manage vendors for purchases",             href: "/masters/suppliers",  icon: Truck,      color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
    { name: "Category Master", desc: "Organize products into categories",        href: "/masters/categories", icon: FolderTree, color: "text-orange-500",  bg: "bg-orange-50 dark:bg-orange-500/10" },
    { name: "Product Master",  desc: "Manage product portfolio, price, GST",    href: "/masters/products",   icon: Package,    color: "text-purple-500",  bg: "bg-purple-50 dark:bg-purple-500/10" },
  ];

  // Admin-only masters
  if (user?.role === "Admin") {
    masters.push(
      { name: "User Master",    desc: "Manage users, roles & authorities", href: "/masters/users",   icon: UserCog,    color: "text-red-500",   bg: "bg-red-50 dark:bg-red-500/10" },
      { name: "Company Master", desc: "Company profile, GSTIN & address",  href: "/masters/company", icon: Building2,  color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
    );
  }

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item      = { hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } };

  return (
    <div className="flex flex-col gap-6 animate-in">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Data Masters</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Setup underlying resources for the ERP.</p>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-4">
        {masters.map((master, i) => (
          <motion.div key={i} variants={item}>
            <Link href={master.href} className="flex items-center justify-between glass-card p-4 rounded-2xl active:scale-95 transition-transform">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-[1.2rem] ${master.bg}`}>
                  <master.icon className={`w-8 h-8 ${master.color}`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{master.name}</h3>
                  <p className="text-sm font-medium text-gray-500">{master.desc}</p>
                </div>
              </div>
              <div className="text-gray-400">
                <ArrowRight className="w-5 h-5" />
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
