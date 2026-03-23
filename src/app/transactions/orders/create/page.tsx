"use client";

import { useStore, QuoteItem, Product } from "@/store/useStore";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, Search, ShoppingCart, Trash2, 
  IndianRupee, ArrowRight, Package, Calculator, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductPicker } from "@/components/ProductPicker";

export default function CreateSalesOrder() {
  const router = useRouter();
  const { clients, products, addSalesOrder } = useStore();

  const [clientId, setClientId] = useState("");
  const [selectedItems, setSelectedItems] = useState<QuoteItem[]>([]);

  const toggleProduct = (p: Product) => {
    const existing = selectedItems.find(i => i.productId === p.id);
    if (existing) {
      setSelectedItems(selectedItems.filter(i => i.productId !== p.id));
    } else {
      setSelectedItems([...selectedItems, { productId: p.id, qty: 1, price: p.price }]);
    }
  };

  const updateQty = (id: string, qty: number) => {
    setSelectedItems(selectedItems.map(i => i.productId === id ? { ...i, qty: Math.max(1, qty) } : i));
  };

  const totalAmount = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  }, [selectedItems]);

  const handleSubmit = () => {
    if (!clientId) return alert("Select a client");
    if (selectedItems.length === 0) return alert("Add at least one product");

    addSalesOrder({
      clientId,
      date: new Date().toISOString(),
      items: selectedItems,
      status: "Booked",
      totalAmount,
    });
    router.push("/transactions/orders");
  };

  return (
    <div className="flex flex-col gap-6 pt-2 pb-32 animate-in relative">
      <div className="px-1">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Sales Order Booking</h2>
        <p className="text-sm text-gray-500">Directly book orders for existing stock</p>
      </div>

      <div className="glass-card p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800">
        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Customer / Client</label>
        <select 
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl px-4 py-3.5 outline-none font-bold"
        >
          <option value="">Select a customer...</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <ProductPicker selectedItems={selectedItems} onToggle={toggleProduct} accentColor="emerald" />

      {selectedItems.length > 0 && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col gap-6">
          <div className="glass-card p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col gap-3">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Items & Quantities</h3>
            <div className="flex flex-col gap-2">
              {selectedItems.map((item) => {
                const prod = products.find(p => p.id === item.productId);
                return (
                  <div key={item.productId} className="flex items-center gap-3 bg-gray-50 dark:bg-zinc-900 p-3 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-gray-100 dark:border-zinc-700">
                      {prod?.imageUrl ? <img src={prod.imageUrl} className="w-full h-full object-cover rounded-xl" /> : <Package className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold dark:text-white truncate">{prod?.name}</p>
                      <p className="text-[10px] text-gray-500">₹{item.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 p-1.5 rounded-xl border border-gray-200 dark:border-zinc-700">
                      <button onClick={() => updateQty(item.productId, item.qty - 1)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-500">−</button>
                      <input 
                        type="number" 
                        value={item.qty} 
                        onChange={(e) => updateQty(item.productId, Number(e.target.value))}
                        className="w-10 text-center text-xs font-black bg-transparent outline-none"
                      />
                      <button onClick={() => updateQty(item.productId, item.qty + 1)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-500">+</button>
                    </div>
                    <button onClick={() => toggleProduct(prod!)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="glass-card p-6 rounded-[2.5rem] shadow-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10"><ShoppingCart className="w-32 h-32" /></div>
             <div className="relative flex flex-col gap-1">
                <span className="text-[10px] uppercase font-black text-white/50 tracking-widest">Total Valuation</span>
                <div className="flex justify-between items-center">
                   <span className="text-3xl font-black">₹{totalAmount.toLocaleString()}</span>
                   <button 
                    onClick={handleSubmit}
                    className="bg-white text-emerald-700 px-8 py-3.5 rounded-2xl font-black flex items-center gap-2 shadow-xl active:scale-95 transition-transform"
                   >
                     Book Order <ArrowRight className="w-5 h-5" />
                   </button>
                </div>
             </div>
          </div>
        </motion.div>
      )}

      {/* Floating Bottom Bar for Mobile Navigation to selection */}
      <AnimatePresence>
        {selectedItems.length > 0 && (
          <motion.div 
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
            className="fixed bottom-6 left-6 right-6 z-40 md:hidden"
          >
             <button 
              onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
              className="w-full bg-emerald-600 text-white p-4 rounded-2xl shadow-2xl shadow-emerald-600/50 flex justify-between items-center border border-white/20"
             >
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-xl"><Package className="w-5 h-5" /></div>
                  <span className="font-bold">{selectedItems.length} Items Selected</span>
                </div>
                <div className="flex items-center gap-1 font-black">
                  ₹{totalAmount.toLocaleString()} <ChevronRight className="w-5 h-5" />
                </div>
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
