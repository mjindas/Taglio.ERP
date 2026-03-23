"use client";

import { useStore } from "@/store/useStore";
import { Receipt, CheckCircle, PackageCheck } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function ReceiptNotes() {
  const purchaseOrders = useStore((state) => state.purchaseOrders);
  const suppliers = useStore((state) => state.suppliers);
  const receivePurchaseOrder = useStore((state) => state.receivePurchaseOrder);

  const pendingPOs = purchaseOrders.filter(p => p.status === "Pending");
  const receivedPOs = purchaseOrders.filter(p => p.status === "Received");

  const getSupplierName = (id: string) => suppliers.find(s => s.id === id)?.name || "Unknown Supplier";

  const handleReceive = (id: string) => {
    if(confirm("Generate Receipt Note & increase inventory stock for this PO?")) {
      receivePurchaseOrder(id);
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="flex flex-col gap-4 animate-in relative pb-16">
      <div className="flex justify-between items-center bg-white/50 border border-gray-100 dark:border-zinc-800 dark:bg-zinc-900/50 p-4 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Receipt Notes
          </h2>
          <p className="text-sm text-gray-500">GRN / Stock Inwards</p>
        </div>
        <div className="bg-emerald-600 text-white rounded-xl p-3 shadow-lg shadow-emerald-500/30">
          <Receipt className="w-5 h-5" />
        </div>
      </div>

      <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="flex flex-col gap-6">
        
        {/* Pending Receipts */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3 ml-1">Pending Issuance ({pendingPOs.length})</h3>
          {pendingPOs.length === 0 ? (
            <p className="text-xs text-gray-400 ml-1">No pending purchase orders to receive.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingPOs.map((po) => (
                <motion.div key={po.id} variants={itemVariants} className="glass-card p-4 rounded-2xl flex flex-col gap-3 active:scale-[0.98] transition-transform">
                  <div className="flex justify-between items-start pb-3 border-b border-gray-100 dark:border-zinc-800">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">PO-{po.id}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{getSupplierName(po.supplierId)}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{format(new Date(po.date), 'dd MMM yyyy')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-indigo-600 dark:text-indigo-400">{po.items.length} Items</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleReceive(po.id)}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl py-3 font-bold active:opacity-70 transition-opacity"
                  >
                    <PackageCheck className="w-5 h-5" /> Generate Receipt Note
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Generated Receipts */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3 ml-1">Issued Receipts ({receivedPOs.length})</h3>
          <div className="flex flex-col gap-3">
            {receivedPOs.map((po) => (
              <motion.div key={po.id} variants={itemVariants} className="glass-card p-4 rounded-2xl flex flex-col gap-3 opacity-70">
                <div className="flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">GRN-{po.id.slice(-4)}</h3>
                      <p className="text-[10px] text-gray-500 mt-0.5">Ref: PO-{po.id}</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded">Stock Updated</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </motion.div>
    </div>
  );
}
