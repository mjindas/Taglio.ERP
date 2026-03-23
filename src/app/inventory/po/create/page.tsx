"use client";

import { useStore, PurchaseOrderItem } from "@/store/useStore";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Plus, Minus, UserPlus } from "lucide-react";

export default function CreatePO() {
  const router = useRouter();
  const { suppliers, products, categories, addPurchaseOrder, addSupplier, user } = useStore();
  
  const [supplierId, setSupplierId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id || "");
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);

  // Inline Supplier Creation State
  const [isCreatingSupplier, setIsCreatingSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState("");
  const canCreateSupplier = user?.role === "Admin" || user?.permissions.masters.suppliers.create;

  const filteredProducts = products.filter(p => p.categoryId === selectedCategory);

  const handleCreateSupplier = () => {
    if (!newSupplierName.trim()) return;
    addSupplier({ name: newSupplierName, mailingName: newSupplierName, gstNumber: "", addressLine: "", city: "", state: "", country: "India", pinCode: "" });
    setNewSupplierName("");
    setIsCreatingSupplier(false);
    // Setting setSupplierId to the newly generated one is tricky synchronously due to Zustand, 
    // so user will just select it from the dropdown which auto updates.
    alert("Supplier Created. Please select it from the dropdown.");
  };

  const addItem = (productId: string, price: number) => {
    setItems((curr) => {
      const existing = curr.find(i => i.productId === productId);
      if (existing) {
        return curr.map(i => i.productId === productId ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...curr, { productId, qty: 1, price }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((curr) => curr.filter(i => i.productId !== productId));
  };

  const updateQty = (productId: string, delta: number) => {
    setItems((curr) => curr.map(i => {
      if (i.productId === productId) {
        const newQty = Math.max(1, i.qty + delta);
        return { ...i, qty: newQty };
      }
      return i;
    }));
  };

  const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handleSave = () => {
    if (!supplierId) return alert("Select a supplier first");
    if (items.length === 0) return alert("Add at least one product to the PO");

    addPurchaseOrder({
      supplierId,
      date: new Date().toISOString(),
      items,
      total
    });
    router.replace("/inventory/po");
  };

  return (
    <div className="animate-in pt-4 pb-24 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Create PO
        </h2>
        <p className="text-gray-500 text-sm">Purchase Order for Inventory.</p>
      </div>

      <div className="glass-card p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800">
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-1">Supplier</label>
        
        {isCreatingSupplier ? (
          <div className="mt-2 flex gap-2">
            <input 
              value={newSupplierName}
              onChange={(e) => setNewSupplierName(e.target.value)}
              placeholder="Supplier Name..."
              className="flex-1 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-sm"
            />
            <button onClick={handleCreateSupplier} className="bg-green-500 text-white px-3 py-2 rounded-xl text-sm font-bold">Save</button>
            <button onClick={() => setIsCreatingSupplier(false)} className="bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 px-3 py-2 rounded-xl text-sm font-bold">X</button>
          </div>
        ) : (
          <div className="flex gap-2">
            <select 
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="flex-1 mt-2 bg-gray-50 dark:bg-zinc-900 border border-transparent focus:border-indigo-500/50 rounded-2xl px-4 py-4 outline-none text-gray-900 dark:text-white"
            >
              <option value="" disabled>Select Supplier</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {canCreateSupplier && (
              <button 
                onClick={() => setIsCreatingSupplier(true)}
                title="Create Supplier Inline"
                className="mt-2 w-14 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center active:scale-95"
              >
                <UserPlus className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest pl-1">Products To Order</label>
        
        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar snap-x">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`snap-start whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                selectedCategory === c.id 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                  : "bg-white dark:bg-zinc-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-zinc-800"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3">
          {filteredProducts.map(p => {
            const inCart = items.find(i => i.productId === p.id);
            return (
              <div key={p.id} className="flex justify-between items-center p-4 bg-white dark:bg-zinc-900/80 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm transition-transform active:scale-[0.98]">
                <div className="flex-1 pr-3">
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 leading-tight">{p.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cost: ₹{p.price} • {p.unit}</p>
                </div>
                {inCart ? (
                  <div className="flex items-center bg-indigo-50 dark:bg-indigo-500/10 rounded-xl overflow-hidden shadow-inner">
                    <button onClick={() => inCart.qty > 1 ? updateQty(p.id, -1) : removeItem(p.id)} className="p-3 active:bg-indigo-100 text-indigo-600"><Minus className="w-4 h-4" /></button>
                    <span className="w-8 text-center font-bold text-sm text-indigo-700">{inCart.qty}</span>
                    <button onClick={() => updateQty(p.id, 1)} className="p-3 active:bg-indigo-100 text-indigo-600"><Plus className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <button 
                    onClick={() => addItem(p.id, p.price)}
                    className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 hover:bg-indigo-50 text-gray-700 font-bold px-4 py-3 rounded-xl transition-colors"
                  >
                    Add
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-t border-gray-200 p-4 pb-safe flex justify-between items-center z-[100] translate-y-[-70px]">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-0.5">Estimated Cost</p>
            <p className="text-2xl font-black text-indigo-600">₹{total.toLocaleString()}</p>
          </div>
          <button 
            onClick={handleSave}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold flex gap-2 items-center shadow-lg active:scale-95 transition-transform"
          >
            <Save className="w-5 h-5" /> Issue PO
          </button>
        </div>
      )}
    </div>
  );
}
