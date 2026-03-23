"use client";

import { useStore } from "@/store/useStore";
import { useState, useMemo } from "react";
import { 
  BarChart3, Boxes, ShoppingCart, 
  ArrowUpRight, ArrowDownLeft, Calendar, 
  Filter, Download, ChevronRight, Package
} from "lucide-react";
import { motion } from "framer-motion";

export default function ReportsPage() {
  const { products, salesOrders, inventoryTransactions, categories } = useStore();
  
  // Date range for Summary Report
  const [fromDate, setFromDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<"requirement" | "summary">("requirement");

  // --- Report 1: Requirement Analysis ---
  const requirementData = useMemo(() => {
    return products.map(p => {
      // Find total qty booked in active Sales Orders (Booked status)
      const bookedQty = salesOrders
        .filter(so => so.status === "Booked")
        .reduce((acc, so) => {
          const item = so.items.find(i => i.productId === p.id);
          return acc + (item?.qty || 0);
        }, 0);

      const freeQty = p.currentStock - bookedQty;
      return { ...p, bookedQty, freeQty };
    });
  }, [products, salesOrders]);

  // --- Report 2: Stock Summary (Opening/Receipt/Sales/Closing) ---
  const stockSummaryData = useMemo(() => {
    const fDate = new Date(fromDate);
    const tDate = new Date(toDate);

    return products.map(p => {
      // Transactions before fromDate (to calculate opening)
      const priorTxns = inventoryTransactions.filter(t => t.productId === p.id && new Date(t.date) < fDate);
      const opening = priorTxns.reduce((acc, t) => acc + (t.type === "Receipt" ? t.qty : -t.qty), 0); // Note: Simple mock opening

      // Transactions within range
      const rangeTxns = inventoryTransactions.filter(t => 
        t.productId === p.id && 
        new Date(t.date) >= fDate && 
        new Date(t.date) <= tDate
      );

      const receipts = rangeTxns.filter(t => t.type === "Receipt").reduce((acc, t) => acc + t.qty, 0);
      const sales = rangeTxns.filter(t => t.type === "Sale").reduce((acc, t) => acc + t.qty, 0);
      const closing = opening + receipts - sales;

      return { ...p, opening, receipts, sales, closing };
    });
  }, [products, inventoryTransactions, fromDate, toDate]);

  return (
    <div className="flex flex-col gap-6 pt-2 pb-20 animate-in">
      <div className="px-1 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Reports & Analytics</h2>
          <p className="text-sm text-gray-500">Inventory movement and requirements</p>
        </div>
        <button className="p-3 bg-gray-100 dark:bg-zinc-800 rounded-2xl text-gray-600 dark:text-gray-300">
           <Download className="w-5 h-5" />
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-gray-100 dark:bg-zinc-900 p-1.5 rounded-[1.5rem] gap-2">
         <button 
           onClick={() => setActiveTab("requirement")}
           className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all ${activeTab === "requirement" ? "bg-white dark:bg-zinc-800 shadow text-indigo-600" : "text-gray-500"}`}
         >
           Requirement Analysis
         </button>
         <button 
           onClick={() => setActiveTab("summary")}
           className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all ${activeTab === "summary" ? "bg-white dark:bg-zinc-800 shadow text-indigo-600" : "text-gray-500"}`}
         >
           Stock Summary
         </button>
      </div>

      {activeTab === "requirement" ? (
        <div className="flex flex-col gap-4">
           {/* Requirement Report Cards */}
           <div className="grid grid-cols-1 gap-3">
              {requirementData.map(p => (
                <div key={p.id} className="glass-card p-4 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col gap-3">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0">
                         {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover rounded-xl" /> : <Package className="w-5 h-5 text-indigo-600" />}
                      </div>
                      <div className="flex-1">
                         <h4 className="text-sm font-black dark:text-white leading-tight">{p.name}</h4>
                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{categories.find(c => c.id === p.categoryId)?.name}</span>
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-3 gap-2">
                      <div className="bg-gray-50 dark:bg-zinc-900/50 p-3 rounded-2xl border border-gray-100 dark:border-zinc-800">
                         <span className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Physical</span>
                         <span className="text-sm font-black dark:text-white">{p.currentStock}</span>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-500/5 p-3 rounded-2xl border border-orange-100 dark:border-orange-500/10">
                         <span className="text-[9px] font-bold text-orange-600 uppercase block mb-1">Booked</span>
                         <span className="text-sm font-black text-orange-700 dark:text-orange-400">{p.bookedQty}</span>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-500/5 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-500/10">
                         <span className="text-[9px] font-bold text-emerald-600 uppercase block mb-1">Free</span>
                         <span className={`text-sm font-black ${p.freeQty < 0 ? 'text-red-500' : 'text-emerald-700 dark:text-emerald-400'}`}>
                           {p.freeQty}
                         </span>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
           {/* Date Range Picker */}
           <div className="flex flex-col gap-2 glass-card p-4 rounded-3xl border border-indigo-100 dark:border-indigo-500/10">
              <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                 <Calendar className="w-3 h-3" /> Report Period
              </label>
              <div className="flex items-center gap-3">
                 <input 
                   type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
                   className="flex-1 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold font-mono"
                 />
                 <span className="text-gray-400">to</span>
                 <input 
                   type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
                   className="flex-1 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold font-mono"
                 />
              </div>
           </div>

           {/* Stock Summary Rows */}
           <div className="flex flex-col gap-3">
              {stockSummaryData.map(p => (
                <div key={p.id} className="glass-card p-4 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col gap-3">
                   <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                           {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover rounded-xl" /> : <Package className="w-5 h-5 text-gray-400" />}
                        </div>
                        <div className="flex flex-col min-w-0">
                           <h4 className="text-sm font-black dark:text-white leading-tight truncate">{p.name}</h4>
                           <span className="text-[10px] font-bold text-gray-400 uppercase">{p.unit}</span>
                        </div>
                      </div>
                      <div className="text-right">
                         <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-tighter">Closing</span>
                         <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 leading-none">{p.closing}</span>
                      </div>
                   </div>

                   <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-zinc-900 rounded-2xl gap-2 font-mono text-[11px] font-bold">
                      <div className="flex flex-col items-center">
                         <span className="text-[9px] text-gray-400 mb-0.5">OPEN</span>
                         <span className="text-gray-700 dark:text-gray-300">{p.opening}</span>
                      </div>
                      <div className="w-px h-6 bg-gray-200 dark:bg-zinc-800" />
                      <div className="flex flex-col items-center">
                         <span className="text-[9px] text-emerald-500 mb-0.5">REC+</span>
                         <span className="text-emerald-600">{p.receipts}</span>
                      </div>
                      <div className="w-px h-6 bg-gray-200 dark:bg-zinc-800" />
                      <div className="flex flex-col items-center">
                         <span className="text-[9px] text-red-500 mb-0.5">SALE-</span>
                         <span className="text-red-500">{p.sales}</span>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
}
