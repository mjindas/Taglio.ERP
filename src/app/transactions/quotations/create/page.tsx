"use client";

import { useStore, QuoteItem, Product } from "@/store/useStore";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  ShoppingCart, Trash2, 
  IndianRupee, Percent, ShieldCheck, ArrowRight,
  Package, Check, Calculator, ChevronRight, ChevronDown
} from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { motion, AnimatePresence } from "framer-motion";

export default function CreateQuotation() {
  const router = useRouter();
  const { clients, categories, products, addQuote } = useStore();

  // Form State
  const [clientId, setClientId] = useState("");
  const [selectedItems, setSelectedItems] = useState<QuoteItem[]>([]);
  const [profitPercent, setProfitPercent] = useState(10);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [isTaxApplicable, setIsTaxApplicable] = useState(true);
  const [showGstBreakdown, setShowGstBreakdown] = useState(false);

  // Search/Filter State
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");

  // Selection Logic
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

  // ─── Standard Indian Quotation Calculation ──────────────────────────
  // Flow:  Base Total → +Profit → Subtotal → −Discount → Taxable Amount
  //        → +GST (per item gstRate%) → Gross Total
  const calculations = useMemo(() => {
    // 1. Per-item line totals
    const lineItems = selectedItems.map(item => {
      const prod = products.find(p => p.id === item.productId);
      const lineBase = item.price * item.qty;
      return {
        ...item,
        product: prod,
        lineBase,
        gstRate: prod?.gstRate ?? 0,
      };
    });

    // 2. Base Total (sum of all line items at selling price)
    const baseTotal = lineItems.reduce((sum, l) => sum + l.lineBase, 0);

    // 3. Profit Loading
    const profitAmount = baseTotal * (profitPercent / 100);
    const subtotal = baseTotal + profitAmount;

    // 4. Discount
    const discountAmount = subtotal * (discountPercent / 100);

    // 5. Taxable Amount
    const taxableAmount = subtotal - discountAmount;

    // 6. GST — calculated proportionally per item using each item's gstRate
    //    Each item's share of the taxable amount = (lineBase / baseTotal) * taxableAmount
    //    Then GST for that item = share × (gstRate / 100)
    const gstBreakdown: { rate: number; taxable: number; gst: number; items: string[] }[] = [];

    let totalGst = 0;
    if (isTaxApplicable && baseTotal > 0) {
      // Group items by GST rate
      const gstGroups: Record<number, { taxable: number; items: string[] }> = {};

      lineItems.forEach(l => {
        const itemShare = (l.lineBase / baseTotal) * taxableAmount;
        const rate = l.gstRate;

        if (!gstGroups[rate]) gstGroups[rate] = { taxable: 0, items: [] };
        gstGroups[rate].taxable += itemShare;
        gstGroups[rate].items.push(l.product?.name ?? "Unknown");
      });

      Object.entries(gstGroups).forEach(([rateStr, group]) => {
        const rate = Number(rateStr);
        const gst = group.taxable * (rate / 100);
        totalGst += gst;
        gstBreakdown.push({ rate, taxable: group.taxable, gst, items: group.items });
      });

      // Sort by rate ascending
      gstBreakdown.sort((a, b) => a.rate - b.rate);
    }

    // 7. Gross Total
    const grossTotal = taxableAmount + totalGst;

    return {
      lineItems,
      baseTotal,
      profitAmount,
      subtotal,
      discountAmount,
      taxableAmount,
      gstBreakdown,
      totalGst,
      grossTotal,
    };
  }, [selectedItems, products, profitPercent, discountPercent, isTaxApplicable]);

  const handleSubmit = () => {
    if (!clientId) return alert("Select a client");
    if (selectedItems.length === 0) return alert("Add at least one product");

    addQuote({
      clientId,
      date: new Date().toISOString(),
      items: selectedItems,
      profitPercent,
      discountPercent,
      isTaxApplicable,
      totalAmount: calculations.grossTotal,
    });
    router.push("/transactions/quotations");
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === "all" || p.categoryId === selectedCat;
    return matchesSearch && matchesCat;
  });

  const fmt = (n: number) => Math.round(n).toLocaleString("en-IN");

  return (
    <div className="flex flex-col gap-6 pt-2 pb-32 animate-in relative">
      <div className="px-1">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">New Cost Estimation</h2>
        <p className="text-sm text-gray-500">Create detailed quotation with profit, discount & product-wise GST</p>
      </div>

      {/* 1. Client Selection */}
      <div className="glass-card p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800">
        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block">Select Client</label>
        <select 
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl px-4 py-3.5 outline-none font-bold"
        >
          <option value="">Choose a client...</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* 2. Product Picker */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Select Products</label>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-full">
            {selectedItems.length} selected
          </span>
        </div>
        
        <SearchBar value={search} onChange={setSearch} placeholder="Search products..." />

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button 
            onClick={() => setSelectedCat("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${selectedCat === "all" ? "bg-indigo-600 text-white" : "bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-gray-500"}`}
          >
            All
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${selectedCat === cat.id ? "bg-indigo-600 text-white" : "bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 text-gray-500"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {filteredProducts.map(p => {
            const isSelected = selectedItems.some(i => i.productId === p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggleProduct(p)}
                className={`relative flex flex-col items-start p-2 rounded-2xl border-2 transition-all text-left group ${
                  isSelected ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 shadow-md" : "border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                }`}
              >
                <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-50 mb-2 relative">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200"><Package /></div>
                  )}
                  {isSelected && (
                    <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                      <div className="bg-indigo-600 text-white p-1.5 rounded-full shadow-lg">
                        <Check className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-0.5 px-1 truncate w-full">
                  <h4 className="text-[10px] font-bold text-indigo-500 uppercase">{categories.find(c => c.id === p.categoryId)?.name}</h4>
                  <p className="text-xs font-black text-gray-900 dark:text-gray-100 truncate w-full">{p.name}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black">₹{p.price.toLocaleString()}</span>
                    <span className="text-[9px] font-bold text-gray-400 bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md">GST {p.gstRate}%</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. Selected Items List & Adjustments */}
      {selectedItems.length > 0 && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col gap-6">
          
          {/* Items & Quantities with per-item GST info */}
          <div className="glass-card p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col gap-3">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Items & Quantities</h3>
            <div className="flex flex-col gap-2">
              {calculations.lineItems.map((item) => {
                const prod = item.product;
                return (
                  <div key={item.productId} className="flex items-center gap-3 bg-gray-50 dark:bg-zinc-900 p-3 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-gray-100 dark:border-zinc-700">
                      {prod?.imageUrl ? <img src={prod.imageUrl} className="w-full h-full object-cover rounded-xl" /> : <Package className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold dark:text-white truncate">{prod?.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-500">₹{item.price.toLocaleString()} / {prod?.unit}</span>
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                          GST {item.gstRate}%
                        </span>
                      </div>
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
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-gray-900 dark:text-white">₹{fmt(item.lineBase)}</p>
                    </div>
                    <button onClick={() => toggleProduct(prod!)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Profit & Discount Controls */}
          <div className="grid grid-cols-1 gap-4">
            <div className="glass-card p-4 rounded-3xl flex flex-col gap-4">
               <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5"><Percent className="w-3 h-3"/> Profit Loading</label>
                    <span className="text-sm font-black text-indigo-600">{profitPercent}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={profitPercent} onChange={(e) => setProfitPercent(Number(e.target.value))} className="w-full accent-indigo-600" />
               </div>
               <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5"><Percent className="w-3 h-3"/> Special Discount</label>
                    <span className="text-sm font-black text-red-500">{discountPercent}%</span>
                  </div>
                  <input type="range" min="0" max="50" value={discountPercent} onChange={(e) => setDiscountPercent(Number(e.target.value))} className="w-full accent-red-500" />
               </div>
            </div>

            {/* Tax Toggle */}
            <button 
              onClick={() => setIsTaxApplicable(!isTaxApplicable)}
              className={`flex items-center justify-between p-4 rounded-3xl border-2 transition-all ${
                isTaxApplicable ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10" : "border-gray-100 dark:border-zinc-800 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isTaxApplicable ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black">GST Applicable</p>
                  <p className="text-[10px] text-gray-500 font-medium">Product-wise GST rates applied individually</p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors ${isTaxApplicable ? "bg-indigo-600" : "bg-gray-200"}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isTaxApplicable ? "right-1" : "left-1"}`} />
              </div>
            </button>
          </div>

          {/* ── Final Summary Card ── */}
          <div className="p-5 rounded-3xl shadow-xl bg-gradient-to-br from-indigo-700 to-purple-800 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10"><Calculator className="w-32 h-32" /></div>
             <div className="relative flex flex-col gap-2.5">

                {/* Base Total */}
                <div className="flex justify-between text-xs font-bold text-white/60 uppercase tracking-widest">
                   <span>Base Total ({selectedItems.length} items)</span>
                   <span>₹{fmt(calculations.baseTotal)}</span>
                </div>

                {/* Profit */}
                {profitPercent > 0 && (
                  <div className="flex justify-between text-xs font-bold text-emerald-300 uppercase tracking-widest">
                    <span>+ Profit Loading ({profitPercent}%)</span>
                    <span>+ ₹{fmt(calculations.profitAmount)}</span>
                  </div>
                )}

                {/* Subtotal */}
                <div className="flex justify-between text-xs font-bold text-white/70 uppercase tracking-widest">
                   <span>Subtotal</span>
                   <span>₹{fmt(calculations.subtotal)}</span>
                </div>

                {/* Discount */}
                {discountPercent > 0 && (
                  <div className="flex justify-between text-xs font-bold text-red-300 uppercase tracking-widest">
                    <span>− Discount ({discountPercent}%)</span>
                    <span>− ₹{fmt(calculations.discountAmount)}</span>
                  </div>
                )}

                {/* Taxable Amount */}
                <div className="h-px bg-white/15 my-1" />
                <div className="flex justify-between text-xs font-bold text-white/80 uppercase tracking-widest">
                   <span>Taxable Amount</span>
                   <span>₹{fmt(calculations.taxableAmount)}</span>
                </div>

                {/* GST — Product-wise Breakdown */}
                {isTaxApplicable && calculations.gstBreakdown.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <button 
                      onClick={() => setShowGstBreakdown(!showGstBreakdown)}
                      className="flex justify-between items-center text-xs font-bold text-indigo-200 uppercase tracking-widest"
                    >
                      <span className="flex items-center gap-1.5">
                        + GST (Product-wise)
                        <ChevronDown className={`w-3 h-3 transition-transform ${showGstBreakdown ? "rotate-180" : ""}`} />
                      </span>
                      <span>+ ₹{fmt(calculations.totalGst)}</span>
                    </button>

                    {/* Expandable GST breakdown by rate */}
                    <AnimatePresence>
                      {showGstBreakdown && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }} 
                          animate={{ height: "auto", opacity: 1 }} 
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-white/10 rounded-xl p-3 flex flex-col gap-2 mt-1">
                            {calculations.gstBreakdown.map((g) => (
                              <div key={g.rate} className="flex flex-col gap-0.5">
                                <div className="flex justify-between text-[10px] font-bold text-white/80">
                                  <span>@ {g.rate}% — {g.items.join(", ")}</span>
                                  <span>₹{fmt(g.gst)}</span>
                                </div>
                                <div className="flex justify-between text-[9px] text-white/40">
                                  <span>Taxable: ₹{fmt(g.taxable)}</span>
                                  <span>CGST {g.rate/2}%: ₹{fmt(g.gst/2)} + SGST {g.rate/2}%: ₹{fmt(g.gst/2)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Gross Total */}
                <div className="h-px bg-white/20 my-1" />
                <div className="flex justify-between items-center">
                   <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black text-white/50 tracking-tighter">Gross Total</span>
                      <span className="text-3xl font-black">₹{fmt(calculations.grossTotal)}</span>
                   </div>
                   <button 
                    onClick={handleSubmit}
                    className="bg-white text-indigo-700 px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl active:scale-95 transition-transform"
                   >
                     Submit Quote <ArrowRight className="w-5 h-5" />
                   </button>
                </div>
             </div>
          </div>
        </motion.div>
      )}

      {/* Floating Action for selection feedback */}
      <AnimatePresence>
        {selectedItems.length > 0 && (
          <motion.div 
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
            className="fixed bottom-6 left-6 right-6 z-40 md:hidden"
          >
             <button 
              onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
              className="w-full bg-indigo-600 text-white p-4 rounded-2xl shadow-2xl shadow-indigo-600/50 flex justify-between items-center"
             >
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-xl"><ShoppingCart className="w-5 h-5" /></div>
                  <span className="font-bold">{selectedItems.length} Products</span>
                </div>
                <div className="flex items-center gap-1 font-black">
                  ₹{fmt(calculations.grossTotal)} <ChevronRight className="w-5 h-5" />
                </div>
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
