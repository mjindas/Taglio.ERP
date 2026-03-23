"use client";

import { useStore, Product } from "@/store/useStore";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  Package, Tag, FileText, IndianRupee, Boxes, 
  Upload, X, Hash, Fingerprint
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

export default function EditProduct() {
  const { id } = useParams();
  const router = useRouter();
  const { products, categories, updateProduct } = useStore();
  const product = products.find(p => p.id === id);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Product | null>(null);

  useEffect(() => {
    if (product) setFormData(product);
  }, [product]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => prev ? { ...prev, imageUrl: reader.result as string } : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData && id) {
      updateProduct(id as string, formData);
      router.back();
    }
  };

  if (!formData) return <div className="p-10 text-center font-bold">Loading...</div>;

  return (
    <div className="animate-in pt-4 pb-16">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="px-1 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Edit Product</h2>
            <p className="text-sm text-gray-500">Update item details and stock</p>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-500/20 text-xs font-black text-indigo-600 uppercase">
             {formData.masterCode}
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
                  <button type="button" onClick={(e) => { e.stopPropagation(); setFormData({...formData, imageUrl: ""}); }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg">
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <div className="p-3 bg-white dark:bg-zinc-800 rounded-full shadow-sm text-gray-400 text-center">
                    <Upload className="w-6 h-6 mx-auto" />
                    <p className="text-[10px] mt-1 font-bold">Replace Cover</p>
                  </div>
                </>
              )}
            </div>
            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageUpload} />
          </div>

          <InputField label="Product Name" icon={Package}>
            <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Product Name" className="w-full bg-transparent px-4 py-4 outline-none text-gray-900 dark:text-white font-bold" />
          </InputField>

          <div className="grid grid-cols-2 gap-4">
             <InputField label="Product Master Code" icon={Fingerprint}>
                <input disabled value={formData.masterCode}
                  className="w-full bg-transparent px-4 py-4 outline-none text-indigo-600 font-black text-sm" />
             </InputField>
             <InputField label="Product Code (Manual)" icon={Hash}>
                <input required value={formData.productCode} onChange={(e) => setFormData({...formData, productCode: e.target.value})}
                  placeholder="SKU Code" className="w-full bg-transparent px-4 py-4 outline-none text-gray-900 dark:text-white font-bold" />
             </InputField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Category">
              <select required value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                className="w-full bg-transparent px-4 py-4 outline-none text-gray-900 dark:text-white appearance-none">
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </InputField>
            <InputField label="Unit">
              <select value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value as any})}
                className="w-full bg-transparent px-4 py-4 outline-none text-gray-900 dark:text-white appearance-none">
                <option value="Per Unit">Per Unit</option>
                <option value="Per 1000">Per 1000</option>
              </select>
            </InputField>
          </div>

          <InputField label="Description">
            <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Brief description" className="w-full h-20 bg-transparent px-4 py-4 outline-none text-gray-900 dark:text-white resize-none" />
          </InputField>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="Purchase Price" icon={IndianRupee}>
              <input required type="number" min="0" value={formData.purchasePrice} onChange={(e) => setFormData({...formData, purchasePrice: Number(e.target.value)})}
                className="w-full bg-transparent px-4 py-4 outline-none text-gray-900 dark:text-white font-bold" />
            </InputField>
            <InputField label="Selling Price" icon={IndianRupee}>
              <input required type="number" min="0" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                className="w-full bg-transparent px-4 py-4 outline-none text-indigo-600 font-bold" />
            </InputField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputField label="HSN Code" icon={FileText}>
              <input required value={formData.hsn} onChange={(e) => setFormData({...formData, hsn: e.target.value})}
                className="w-full bg-transparent px-4 py-4 outline-none text-gray-900 dark:text-white font-mono" />
            </InputField>
            <InputField label="GST %" icon={Tag}>
              <input required type="number" min="0" value={formData.gstRate} onChange={(e) => setFormData({...formData, gstRate: Number(e.target.value)})}
                className="w-full bg-transparent px-4 py-4 outline-none text-gray-900 dark:text-white" />
            </InputField>
          </div>

          <InputField label="Current Stock" icon={Boxes}>
            <input type="number" min="0" value={formData.currentStock} onChange={(e) => setFormData({...formData, currentStock: Number(e.target.value)})}
              className="w-full bg-transparent px-4 py-4 outline-none text-gray-900 dark:text-white" />
          </InputField>

        </div>

        <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg py-4 rounded-3xl shadow-lg shadow-indigo-600/30 active:scale-[0.98] transition-all">
          Update Product
        </button>
      </form>
    </div>
  );
}
