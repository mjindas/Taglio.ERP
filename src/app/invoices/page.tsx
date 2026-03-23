"use client";

import { useStore } from "@/store/useStore";
import { ListChecks, Link as LinkIcon, Download } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function InvoicesList() {
  const quotes = useStore((state) => state.quotes);
  const clients = useStore((state) => state.clients);

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || "Unknown";
  const getClientPhone = (id: string) => clients.find(c => c.id === id)?.phone || "";

  const invoices = quotes.filter(q => q.status === "Converted");

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  const handleShareWhatsApp = (clientPhone: string, invoiceId: string, total: number) => {
    if(!clientPhone) return alert("Client has no phone number");
    const msg = encodeURIComponent(`Hello,\n\nYour Sales Invoice INV-${invoiceId} of ₹${total} has been generated. Please find the details attached.\n\nThank you for choosing Taglio ERP.`);
    window.open(`https://wa.me/91${clientPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="flex flex-col gap-4 animate-in relative pb-16">
      <div className="flex justify-between items-center bg-white/50 border border-gray-100 dark:border-zinc-800 dark:bg-zinc-900/50 p-4 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Sales Invoices
          </h2>
          <p className="text-sm text-gray-500">View & Dispatch</p>
        </div>
        <div className="bg-red-500 text-white rounded-xl p-3 shadow-lg shadow-red-500/30">
          <ListChecks className="w-5 h-5" />
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 text-center text-gray-500">
          <div className="bg-gray-100 dark:bg-zinc-800 p-4 rounded-full mb-4">
            <ListChecks className="w-8 h-8 text-gray-400" />
          </div>
          <p>No invoices available</p>
        </div>
      ) : (
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="flex flex-col gap-3">
          {invoices.map((quote) => (
            <motion.div key={quote.id} variants={itemVariants} className="glass-card p-4 rounded-2xl flex flex-col gap-3 active:scale-[0.98] transition-transform">
              <div className="flex justify-between items-start border-b border-gray-100 dark:border-zinc-800 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">INV-01{quote.id.slice(-3)}</h3>
                  <p className="text-[10px] text-gray-500 font-semibold">{getClientName(quote.clientId)}</p>
                  <p className="text-[10px] text-gray-400">{format(new Date(), 'dd MMM yyyy')}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-red-500 dark:text-red-400">₹{quote.totalAmount.toLocaleString()}</p>
                  <p className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full inline-block font-semibold mt-1 flex gap-1 items-center justify-center"><ListChecks className="w-3 h-3"/> Dispatched</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <button className="flex items-center justify-center gap-2 bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 rounded-xl py-2 font-semibold active:opacity-70 transition-opacity">
                  <Download className="w-4 h-4" /> PDF
                </button>
                <button 
                  onClick={() => handleShareWhatsApp(getClientPhone(quote.clientId), quote.id, quote.totalAmount)}
                  className="flex items-center justify-center gap-2 bg-green-500 text-white rounded-xl py-2 font-semibold active:opacity-70 transition-opacity shadow-lg shadow-green-500/30"
                >
                  <LinkIcon className="w-4 h-4" /> WhatsApp
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
