"use client";

import { useStore } from "@/store/useStore";
import { FileSpreadsheet, Plus, Minus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function StockLedger() {
  const products = useStore((state) => state.products);
  const categories = useStore((state) => state.categories);

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || "Unknown";

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="flex flex-col gap-4 animate-in relative pb-16">
      <div className="flex justify-between items-center bg-white/50 border border-gray-100 dark:border-zinc-800 dark:bg-zinc-900/50 p-4 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Stock Report
          </h2>
          <p className="text-sm text-gray-500">Live Inventory Balance</p>
        </div>
        <div className="bg-purple-600 text-white rounded-xl p-3 shadow-lg shadow-purple-500/30">
          <FileSpreadsheet className="w-5 h-5" />
        </div>
      </div>

      <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="flex flex-col gap-3">
        {products.map((product) => (
          <motion.div key={product.id} variants={itemVariants} className="glass-card p-4 rounded-2xl flex flex-col gap-3 active:scale-[0.98] transition-transform">
            <div className="flex justify-between items-start border-b border-gray-100 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">{product.name}</h3>
                <span className="text-[10px] bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 font-semibold px-2 py-0.5 rounded-full inline-block mt-2">
                  {getCategoryName(product.categoryId)}
                </span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{product.currentStock}</p>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">{product.unit === 'Per Unit' ? 'Units' : 'Thousand Pcs'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 uppercase font-bold tracking-widest text-[10px]">
              <div className="flex items-center gap-1.5 justify-center bg-gray-50 dark:bg-zinc-800 py-2 rounded-xl text-emerald-600">
                <ArrowDownRight className="w-4 h-4" /> INWARDS
              </div>
              <div className="flex items-center gap-1.5 justify-center bg-gray-50 dark:bg-zinc-800 py-2 rounded-xl text-red-500">
                <ArrowUpRight className="w-4 h-4" /> ISSUES
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
