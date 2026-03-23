"use client";

import { useStore } from "@/store/useStore";
import { useModulePermission } from "@/hooks/usePermissions";
import { Plus, User, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchBar } from "@/components/SearchBar";

export default function ClientMaster() {
  const clients = useStore((state) => state.clients);
  const deleteClient = useStore((state) => state.deleteClient);
  const perm = useModulePermission("masters", "clients");
  const [search, setSearch] = useState("");

  const filtered = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete client "${name}"?`)) deleteClient(id);
  };

  return (
    <div className="flex flex-col gap-6 pt-2 pb-20 animate-in">
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Clients</h2>
          <p className="text-sm text-gray-500">Manage your customer base</p>
        </div>
        {perm.create && (
          <Link href="/masters/clients/create"
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl p-4 shadow-lg shadow-indigo-600/30 transition-all active:scale-95">
            <Plus className="w-6 h-6" />
          </Link>
        )}
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search by name, email, or phone..." />

      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((client) => (
            <motion.div 
              layout key={client.id} initial={{ x: -20, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="group glass-card p-4 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl">
                  {client.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">{client.name}</h3>
                  <p className="text-xs text-gray-500">{client.email}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                {perm.update && (
                  <Link href={`/masters/clients/${client.id}/edit`} className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                    <Pencil className="w-5 h-5" />
                  </Link>
                )}
                {perm.delete && (
                  <button onClick={() => handleDelete(client.id, client.name)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
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
           <User className="w-12 h-12 mb-2" />
           <p className="font-bold">No clients found.</p>
        </div>
      )}
    </div>
  );
}
