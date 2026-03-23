"use client";

import { useStore, SalesOrder } from "@/store/useStore";
import { 
  Plus, CheckCircle2, Clock, Truck, 
  ArrowRight, FileText, Calendar, 
  Package, ShoppingCart
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";

export default function SalesOrdersList() {
  const { salesOrders, clients, dispatchSalesOrder } = useStore();
  const [search, setSearch] = useState("");

  const filtered = salesOrders.filter(so => {
    const clientName = clients.find(c => c.id === so.clientId)?.name || "";
    return clientName.toLowerCase().includes(search.toLowerCase()) || so.id.toLowerCase().includes(search.toLowerCase());
  });

  const handleDispatch = (id: string) => {
    if (confirm("Dispatch items and generate inventory movement?")) {
      dispatchSalesOrder(id);
    }
  };

  const StatusBadge = ({ status }: { status: SalesOrder["status"] }) => {
    const configs = {
      "Booked": { icon: ShoppingCart, bg: "bg-amber-100 text-amber-700" },
      "Dispatched": { icon: Truck, bg: "bg-emerald-100 text-emerald-700" },
      "Cancelled": { icon: CheckCircle2, bg: "bg-red-100 text-red-700" },
    };
    const config = configs[status];
    return (
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${config.bg}`}>
        <config.icon className="w-3 h-3" /> {status}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 pt-2 pb-20 animate-in">
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Sales Orders</h2>
          <p className="text-sm text-gray-500">Booked & Dispatched Orders</p>
        </div>
        <Link href="/transactions/orders/create"
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl p-4 shadow-lg shadow-emerald-600/30 transition-all active:scale-95">
          <Plus className="w-6 h-6" />
        </Link>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search by client or Order ID..." />

      <div className="flex flex-col gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((so) => {
            const client = clients.find(c => c.id === so.clientId);
            return (
              <motion.div 
                layout key={so.id} initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
                className="glass-card p-5 rounded-[2rem] border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col gap-4"
              >
                <div className="flex justify-between items-start">
                   <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-xl">
                         {client?.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                         <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 leading-none">{client?.name}</h3>
                         <span className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{so.id}</span>
                      </div>
                   </div>
                   <StatusBadge status={so.status} />
                </div>

                <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-2xl">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</span>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">₹{so.totalAmount.toLocaleString()}</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</span>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{new Date(so.date).toLocaleDateString()}</span>
                   </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 dark:border-zinc-800 pt-3">
                   <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400">
                      <div className="flex items-center gap-1.5"><Package className="w-3 h-3"/> {so.items.length} SKUs</div>
                   </div>
                   
                   {so.status === "Booked" && (
                    <button 
                      onClick={() => handleDispatch(so.id)}
                      className="flex items-center gap-1.5 bg-emerald-600 text-white px-5 py-2.5 rounded-2xl text-xs font-black shadow-lg shadow-emerald-600/20 active:scale-95 transition-transform"
                    >
                      <Truck className="w-4 h-4" /> Dispatch Now
                    </button>
                   )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
          <ShoppingCart className="w-16 h-16 mb-2" />
          <p className="font-bold">No sales orders found.</p>
        </div>
      )}
    </div>
  );
}
