"use client";

import { useStore, Quote } from "@/store/useStore";
import { useModulePermission } from "@/hooks/usePermissions";
import { 
  Plus, CheckCircle2, Clock, XCircle, 
  ArrowRight, FileText, User, Calendar, 
  Trash2, ShieldCheck, CheckSquare, ShoppingBag,
  Eye, Printer, MessageCircle
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";

export default function QuotationsList() {
  const router = useRouter();
  const { quotes, clients, updateQuoteStatus, addSalesOrder, user } = useStore();
  const perm = useModulePermission("transactions", "quotations");
  
  const [search, setSearch] = useState("");

  const filtered = quotes.filter(q => {
    const clientName = clients.find(c => c.id === q.clientId)?.name || "";
    return clientName.toLowerCase().includes(search.toLowerCase()) || q.id.toLowerCase().includes(search.toLowerCase());
  });

  const handleApprove = (id: string) => {
    if (confirm("Approve this quotation for Sales Order creation?")) {
      updateQuoteStatus(id, "Approved", user?.id || "unknown");
    }
  };

  const handleCreateOrder = (q: Quote) => {
    addSalesOrder({
      clientId: q.clientId,
      quoteId: q.id,
      date: new Date().toISOString(),
      items: q.items,
      status: "Booked",
      totalAmount: q.totalAmount
    });
    router.push("/transactions/orders");
  };

  const StatusBadge = ({ status }: { status: Quote["status"] }) => {
    const configs = {
      "Draft": { icon: FileText, bg: "bg-gray-100 text-gray-600" },
      "Pending Approval": { icon: Clock, bg: "bg-amber-100 text-amber-700" },
      "Approved": { icon: CheckCircle2, bg: "bg-green-100 text-green-700" },
      "Rejected": { icon: XCircle, bg: "bg-red-100 text-red-700" },
      "Converted": { icon: ShoppingBag, bg: "bg-indigo-100 text-indigo-700" },
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
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Quotations</h2>
          <p className="text-sm text-gray-500">Approvals & Workflow</p>
        </div>
        {perm.create && (
          <Link href="/transactions/quotations/create"
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl p-4 shadow-lg shadow-indigo-600/30 transition-all active:scale-95">
            <Plus className="w-6 h-6" />
          </Link>
        )}
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search by client or Quote ID..." />

      <div className="flex flex-col gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((q) => {
            const client = clients.find(c => c.id === q.clientId);
            return (
              <motion.div 
                layout key={q.id} initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
                className="glass-card p-5 rounded-[2rem] border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col gap-4"
              >
                <div className="flex justify-between items-start">
                   <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xl">
                         {client?.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                         <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 leading-none">{client?.name}</h3>
                         <span className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{q.id}</span>
                      </div>
                   </div>
                   <StatusBadge status={q.status} />
                </div>

                <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-zinc-900/50 p-4 rounded-2xl">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</span>
                      <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">₹{q.totalAmount.toLocaleString()}</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Items</span>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{q.items.length} Products</span>
                   </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 dark:border-zinc-800 pt-3">
                   <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400">
                      <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3"/> {new Date(q.date).toLocaleDateString()}</div>
                      {q.approvedBy && <div className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3"/> Approved</div>}
                   </div>
                   
                   <div className="flex gap-2">
                       {/* View / Print / Share */}
                       <Link href={`/transactions/quotations/${q.id}`}
                         className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 dark:hover:bg-zinc-700 active:scale-95 transition-all">
                         <Eye className="w-3.5 h-3.5" /> View
                       </Link>

                      {/* Workflow Actions */}
                      {q.status === "Pending Approval" && perm.update && (
                        <button 
                          onClick={() => handleApprove(q.id)}
                          className="flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-green-600/20 active:scale-95 transition-transform"
                        >
                          <CheckSquare className="w-4 h-4" /> Approve
                        </button>
                      )}

                      {q.status === "Approved" && (
                        <button 
                          onClick={() => handleCreateOrder(q)}
                          className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-indigo-600/20 active:scale-95 transition-transform"
                        >
                          <ArrowRight className="w-4 h-4" /> Create SO
                        </button>
                      )}
                   </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
          <FileText className="w-16 h-16 mb-2" />
          <p className="font-bold">No quotations found.</p>
        </div>
      )}
    </div>
  );
}
