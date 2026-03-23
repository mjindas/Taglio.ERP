"use client";

import { useStore, Product } from "@/store/useStore";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Package, Tag, FileText, IndianRupee, Boxes, 
  Image as ImageIcon, Upload, X, Hash, Fingerprint
} from "lucide-react";

const InputField = ({ label, icon: Icon, children }: any) => (
  <div className="space-y-1">
    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">{label}</label>
    <div className="relative flex items-center bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
      {Icon && <Icon className="ml-4 w-5 h-5 text-gray-400 shrink-0" />}
      {children}
    </div>
  </div>
);

export default function AddProduct() {
  const router = useRouter();
  const addProduct = useStore((state) => state.addProduct);
  const categories = useStore((state) => state.categories);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Omit<Product, "id" | "masterCode">>({
    productCode: "",
    name: "",
    categoryId: categories[0]?.id || "",
    description: "",
    unit: "Per Unit",
    purchasePrice: 0,
    price: 0,
    hsn: "",
    gstRate: 0,
    currentStock: 0,
    imageUrl: ""
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(formData.categoryId) {
      addProduct(formData as any);
      router.back();
    } else {
      alert("Please add a category first.");
    }
  };

  return (
    <div className="animate-in pt-4 pb-16">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="px-1 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Create Product</h2>
            <p className="text-gray-500 text-sm">Add item into the product portfolio.</p>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
             <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Master Code Enabled</span>
          </div>
        </div>
        
        <div className="glass-card rounded-3xl p-5 shadow-lg flex flex-col gap-4">
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Product Image</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative w-full aspect-video rounded-2xl border-2 border-dashed border-gray-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-indigo-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all overflow-hidden bg-gray-50 dark:bg-zinc-900"
            >
              {formData.imageUrl ? (
                <>
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFormData({...formData, imageUrl: ""}); }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <div className="p-3 bg-white dark:bg-zinc-800 rounded-full shadow-sm text-gray-400">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Click to upload image</p>
                    <p className="text-[10px] text-gray-500">PNG, JPG or WebP (Max 2MB)</p>
                  </div>
                </>
              )}
            </div>
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />
          </div>

          <InputField label="Product Name" icon={Package}>
            <input required value={formData.name} onChange={(e: any) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Wireless Mouse X1" className="w-full bg-transparent px-4 py-4 outline-none text-gray-900 dark:text-white font-bold" />
          </InputField>

          <div className="grid grid-cols-2 gap-4">
             <InputField label="Product Master Code" icon={Fingerprint}>
                <input disabled value="[ AUTO ]"
                  className="w-full bg-transparent px-4 py-4 outline-none text-indigo-600 font-bold text-xs" />
             </InputField>
             <InputField label="Product Code (Manual)" icon={Hash}>
                <input required value={formData.productCode} onChange={(e: any) => setFormData({...formData, productCode: e.target.value})}
                  placeholder="SKU / Ref Code" className="w-full bg-transparent px-4 py-4 outline-none text-gray-900 dark:text-white font-bold" />
             </InputField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Category">
              <select required value={formData.categoryId} onChange={(e: any) => setFormData({...formData, categoryId: e.target.value})}
                className="w-full bg-transparent px-4 py-4 outline-none text-gray-900 dark:text-white appearance-none">
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </InputField>
            <InputField label="Unit">
              <select value={formData.unit} onChange={(e: any) => setFormData({...formData, unit: e.target.value as any})}
                className="w-full bg-transparent px-4 py-4 outline-none text-gray-900 dark:text-white appearance-none">
                <option value="Per Unit">Per Unit</option>
                <option value="Per 1000">Per 1000</option>
              </select>
            </InputField>
          </div>

          <InputField label="Description">
            <textarea value={formData.description} onChange={(e: any) => setFormData({...formData, description: e.target.value})}
              placeholder="Brief description" className="w-full h-20 bg-transparent px-4 py-4 outline-none text-gray-900 dark:text-white resize-none" />
          </InputField>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Purchase Price" icon={IndianRupee}>
              <input required type="number" min="0" value={formData.purchasePrice} onChange={(e: any) => setFormData({...formData, purchasePrice: Number(e.target.value)})}
                className="w-full bg-transparent px-4 py-4 outline-none text-gray-900 dark:text-white font-bold" />
            </InputField>
            <InputField label="Selling Price" icon={IndianRupee}>
              <input required type="number" min="0" value={formData.price} onChange={(e: any) => setFormData({...formData, price: Number(e.target.value)})}
                className="w-full bg-transparent px-4 py-4 outline-none text-gray-900 dark:text-white font-bold text-indigo-600" />
            </InputField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="HSN Code" icon={FileText}>
              <input required value={formData.hsn} onChange={(e: any) => setFormData({...formData, hsn: e.target.value})}
                className="w-full bg-transparent px-4 py-4 outline-none text-gray-900 dark:text-white font-mono" />
            </InputField>
            <InputField label="GST %" icon={Tag}>
              <input required type="number" min="0" value={formData.gstRate} onChange={(e: any) => setFormData({...formData, gstRate: Number(e.target.value)})}
                className="w-full bg-transparent px-4 py-4 outline-none text-gray-900 dark:text-white font-bold" />
            </InputField>
          </div>

          <InputField label="Opening Stock" icon={Boxes}>
            <input type="number" min="0" value={formData.currentStock} onChange={(e: any) => setFormData({...formData, currentStock: Number(e.target.value)})}
              placeholder="Initial balance" className="w-full bg-transparent px-4 py-4 outline-none text-gray-900 dark:text-white" />
          </InputField>

        </div>

        <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg py-4 rounded-3xl shadow-lg shadow-indigo-600/30 active:scale-[0.98] transition-all">
          Save Product
        </button>
      </form>
    </div>
  );
}
