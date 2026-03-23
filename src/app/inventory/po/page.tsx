"use client";

import { useStore } from "@/store/useStore";
import { Plus, PackageOpen, CheckCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function PurchaseOrders() {
  const purchaseOrders = useStore((state) => state.purchaseOrders);
  const suppliers = useStore((state) => state.suppliers);

  const getSupplierName = (id: string) => suppliers.find(s => s.id === id)?.name || "Unknown Supplier";

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="flex flex-col gap-4 animate-in relative pb-16">
      <div className="flex justify-between items-center bg-white/50 border border-gray-100 dark:border-zinc-800 dark:bg-zinc-900/50 p-4 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Purchase Orders
          </h2>
          <p className="text-sm text-gray-500">{purchaseOrders.length} POs created</p>
        </div>
        <Link href="/inventory/po/create" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-3 shadow-lg shadow-blue-500/30 transition-transform active:scale-90">
          <Plus className="w-5 h-5" />
        </Link>
      </div>

      {purchaseOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 text-center text-gray-500">
          <div className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-full mb-4">
            <PackageOpen className="w-8 h-8 text-gray-400" />
          </div>
          <p>No purchase orders found.</p>
          <Link href="/inventory/po/create" className="text-blue-500 font-bold mt-2">Generate PO</Link>
        </div>
      ) : (
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="flex flex-col gap-3">
          {purchaseOrders.map((po) => (
            <motion.div key={po.id} variants={itemVariants} className="glass-card p-4 rounded-2xl flex flex-col gap-3 active:scale-[0.98] transition-transform">
              <div className="flex justify-between items-start border-b border-gray-100 dark:border-zinc-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">PO-{po.id}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{getSupplierName(po.supplierId)}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{format(new Date(po.date), 'dd MMM yyyy, hh:mm a')}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${po.status === 'Received' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {po.status}
                  </span>
                  <p className="text-lg font-black mt-1 text-indigo-600 dark:text-indigo-400">₹{po.total}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
