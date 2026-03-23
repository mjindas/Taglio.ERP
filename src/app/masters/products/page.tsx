"use client";

import { useStore } from "@/store/useStore";
import { useModulePermission } from "@/hooks/usePermissions";
import { Plus, Package, Pencil, Trash2, Filter } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchBar } from "@/components/SearchBar";

export default function ProductMaster() {
  const products = useStore((s) => s.products);
  const categories = useStore((s) => s.categories);
  const deleteProduct = useStore((s) => s.deleteProduct);
  const perm = useModulePermission("masters", "products");

  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");

  const filtered = products.filter(p => {
    const s = search.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(s) || 
                         p.description.toLowerCase().includes(s) ||
                         p.hsn.includes(search) ||
                         p.masterCode.toLowerCase().includes(s) ||
                         p.productCode.toLowerCase().includes(s);
    const matchesCat = selectedCat === "all" || p.categoryId === selectedCat;
    return matchesSearch && matchesCat;
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete product "${name}"?`)) deleteProduct(id);
  };

  return (
    <div className="flex flex-col gap-6 pt-2 pb-20 animate-in">
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Product Portfolio</h2>
          <p className="text-sm text-gray-500">Manage products, pricing, and stock</p>
        </div>
        {perm.create && (
          <Link href="/masters/products/create"
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl p-4 shadow-lg shadow-indigo-600/30 transition-all active:scale-95">
            <Plus className="w-6 h-6" />
          </Link>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, desc, or HSN..." />
        
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
          <div className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-xl shrink-0">
            <Filter className="w-4 h-4 text-gray-500" />
          </div>
          <button
            onClick={() => setSelectedCat("all")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              selectedCat === "all" ? "bg-indigo-600 text-white" : "bg-white dark:bg-zinc-900 text-gray-500 border border-gray-100 dark:border-zinc-800"
            }`}
          >
            All Categories
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                selectedCat === cat.id ? "bg-indigo-600 text-white" : "bg-white dark:bg-zinc-900 text-gray-500 border border-gray-100 dark:border-zinc-800"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((p) => (
            <motion.div
              layout
              key={p.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="group bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col"
            >
              {/* Product Image Area */}
              <div className="relative aspect-square bg-gray-50 dark:bg-zinc-800 overflow-hidden">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Package className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {perm.update && (
                    <Link href={`/masters/products/${p.id}/edit`} className="p-2 bg-white/90 dark:bg-zinc-900/90 rounded-xl shadow-lg backdrop-blur text-gray-700 dark:text-gray-200">
                      <Pencil className="w-4 h-4" />
                    </Link>
                  )}
                  {perm.delete && (
                    <button onClick={() => handleDelete(p.id, p.name)} className="p-2 bg-white/90 dark:bg-zinc-900/90 rounded-xl shadow-lg backdrop-blur text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {/* Stock Badge */}
                <div className={`absolute bottom-2 left-2 px-2 py-1 rounded-lg text-[10px] font-black uppercase ${p.currentStock > 10 ? "bg-emerald-500/90 text-white" : "bg-orange-500/90 text-white"}`}>
                  Stock: {p.currentStock}
                </div>
              </div>

              {/* Info Area */}
              <div className="p-3 flex flex-col gap-1">
                <div className="flex flex-col">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-tight truncate">
                      {categories.find(c => c.id === p.categoryId)?.name}
                    </span>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[9px] font-black text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-zinc-800 px-1.5 py-0.5 rounded-lg border border-gray-100 dark:border-zinc-800">
                        {p.masterCode}
                      </span>
                      <span className="text-[9px] font-black text-indigo-600/60 dark:text-indigo-400/60 px-1.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10">
                        {p.productCode}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight line-clamp-1">{p.name}</h3>
                </div>
                <div className="flex items-end justify-between mt-1">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-medium">Price /{p.unit === "Per Unit" ? "pc" : "1k"}</span>
                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                      ₹{p.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-zinc-800">
          <Package className="w-12 h-12 text-gray-300 mb-2" />
          <p className="text-gray-500 font-medium">No products found results.</p>
        </div>
      )}
    </div>
  );
}
