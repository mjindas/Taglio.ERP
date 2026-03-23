"use client";

import { useStore } from "@/store/useStore";
import { useModulePermission } from "@/hooks/usePermissions";
import { Plus, Truck, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchBar } from "@/components/SearchBar";

export default function SupplierMaster() {
  const suppliers = useStore((state) => state.suppliers);
  const deleteSupplier = useStore((state) => state.deleteSupplier);
  const perm = useModulePermission("masters", "suppliers");
  const [search, setSearch] = useState("");

  const filtered = suppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.gstNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete supplier "${name}"?`)) deleteSupplier(id);
  };

  return (
    <div className="flex flex-col gap-6 pt-2 pb-20 animate-in">
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Suppliers</h2>
          <p className="text-sm text-gray-500">Manage vendor relationships</p>
        </div>
        {perm.create && (
          <Link href="/masters/suppliers/create"
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl p-4 shadow-lg shadow-indigo-600/30 transition-all active:scale-95">
            <Plus className="w-6 h-6" />
          </Link>
        )}
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search by name or GST..." />

      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((sup) => (
            <motion.div 
              layout key={sup.id} initial={{ x: -20, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="group glass-card p-4 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-xl">
                  {sup.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">{sup.name}</h3>
                  <p className="text-xs text-gray-500">GST: {sup.gstNumber || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                {perm.update && (
                  <Link href={`/masters/suppliers/${sup.id}/edit`} className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    <Pencil className="w-5 h-5" />
                  </Link>
                )}
                {perm.delete && (
                  <button onClick={() => handleDelete(sup.id, sup.name)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
           <Truck className="w-12 h-12 mb-2" />
           <p className="font-bold">No suppliers found.</p>
        </div>
      )}
    </div>
  );
}
