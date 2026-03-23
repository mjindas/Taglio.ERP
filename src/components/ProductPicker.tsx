"use client";

import { useStore, Product, QuoteItem } from "@/store/useStore";
import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { Package, Check, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  selectedItems: QuoteItem[];
  onToggle: (p: Product) => void;
  accentColor?: string;
}

export function ProductPicker({ selectedItems, onToggle, accentColor = "indigo" }: Props) {
  const { products, categories } = useStore();
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === "all" || p.categoryId === selectedCat;
    return matchesSearch && matchesCat;
  });

  const bgClass = accentColor === "indigo" ? "bg-indigo-600" : "bg-emerald-600";
  const borderClass = accentColor === "indigo" ? "border-indigo-600" : "border-emerald-600";
  const lightBgClass = accentColor === "indigo" ? "bg-indigo-50 dark:bg-indigo-500/10" : "bg-emerald-50 dark:bg-emerald-500/10";
  const textClass = accentColor === "indigo" ? "text-indigo-600" : "text-emerald-600";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Select Products</label>
        <span className={`text-xs font-bold ${textClass} ${lightBgClass} px-2.5 py-1 rounded-full`}>
          {selectedItems.length} selected
        </span>
      </div>
      
      <SearchBar value={search} onChange={setSearch} placeholder="Search product name or desc..." />

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button 
          onClick={() => setSelectedCat("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${selectedCat === "all" ? `${bgClass} text-white` : "bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-gray-500"}`}
        >
          All Categories
        </button>
        {categories.map(cat => (
          <button 
            key={cat.id}
            onClick={() => setSelectedCat(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${selectedCat === cat.id ? `${bgClass} text-white` : "bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-gray-500"}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map(p => {
            const isSelected = selectedItems.some(i => i.productId === p.id);
            return (
              <motion.button
                layout
                key={p.id}
                onClick={() => onToggle(p)}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`relative flex flex-col items-start p-2 rounded-2xl border-2 transition-all text-left group ${
                  isSelected ? `${borderClass} ${lightBgClass} shadow-md` : "border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                }`}
              >
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-50 dark:bg-zinc-800 mb-2 relative">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200"><Package /></div>
                  )}
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className={`${bgClass} text-white p-1.5 rounded-full shadow-lg`}>
                          <Check className="w-4 h-4" />
                       </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-0.5 px-1 truncate w-full">
                  <div className="flex justify-between items-start w-full">
                    <h4 className={`text-[10px] font-bold ${textClass} uppercase truncate`}>
                      {categories.find((c) => c.id === p.categoryId)?.name}
                    </h4>
                    <div className="flex flex-col items-end opacity-70">
                      <span className="text-[8px] font-black text-gray-400">
                        {p.masterCode}
                      </span>
                      <span className={`text-[8px] font-black ${textClass}`}>
                        {p.productCode}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs font-black text-gray-900 dark:text-gray-100 truncate w-full">{p.name}</p>
                  <p className={`text-[10px] ${textClass} font-black mt-1`}>₹{p.price.toLocaleString()}</p>
                </div>
              </motion.button>
            )
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center opacity-40 flex flex-col items-center">
          <Package className="w-12 h-12 mb-2" />
          <p className="text-sm font-bold">No products matching filters.</p>
        </div>
      )}
    </div>
  );
}
