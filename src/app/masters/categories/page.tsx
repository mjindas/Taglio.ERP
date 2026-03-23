"use client";

import { useStore } from "@/store/useStore";
import { Plus, FolderTree } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CategoryMaster() {
  const categories = useStore((state) => state.categories);
  const products = useStore((state) => state.products);

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="flex flex-col gap-4 animate-in relative pb-16">
      <div className="flex justify-between items-center bg-white/50 border border-gray-100 dark:border-zinc-800 dark:bg-zinc-900/50 p-4 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Categories
          </h2>
          <p className="text-sm text-gray-500">Total {categories.length} categories</p>
        </div>
        <Link href="/masters/categories/create" className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl p-3 shadow-lg shadow-orange-500/30 transition-transform active:scale-90">
          <Plus className="w-5 h-5" />
        </Link>
      </div>

      <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="flex flex-col gap-3">
        {categories.map((category) => {
          const productCount = products.filter(p => p.categoryId === category.id).length;
          
          return (
            <motion.div key={category.id} variants={itemVariants} className="glass-card p-4 rounded-2xl flex items-center justify-between active:scale-[0.98] transition-transform">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-orange-50 dark:bg-orange-500/10 rounded-[1rem] flex justify-center items-center text-orange-500 font-bold text-xl">
                  <FolderTree className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">{category.name}</h3>
                  <span className="text-xs bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full inline-block mt-1">ID: {category.id}</span>
                </div>
              </div>
              <div className="text-center w-14 p-2 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
                <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">{productCount}</p>
                <p className="text-[10px] font-semibold text-gray-500 mt-1 uppercase">Items</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
