"use client";

import { useStore } from "@/store/useStore";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderTree } from "lucide-react";

export default function AddCategory() {
  const router = useRouter();
  const addCategory = useStore((state) => state.addCategory);
  
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(name.trim() !== "") {
      addCategory({ name });
      router.back();
    }
  };

  return (
    <div className="animate-in pt-4 pb-16 h-full flex flex-col justify-between">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">
        <div className="flex flex-col gap-1 mb-2">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Create Category
          </h2>
          <p className="text-gray-500 text-sm">Add a product grouping classification.</p>
        </div>
        
        <div className="glass-card rounded-3xl p-5 shadow-lg flex flex-col gap-5">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Category Name</label>
            <div className="relative flex items-center bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-orange-500/50 transition-all">
              <FolderTree className="ml-4 w-5 h-5 text-gray-400 shrink-0" />
              <input 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Electricals"
                className="w-full bg-transparent px-4 py-4 outline-none text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          className="mt-6 w-full bg-gradient-to-r from-orange-400 to-red-500 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-orange-500/30 active:scale-[0.98] transition-all"
        >
          Save Category
        </button>
      </form>
    </div>
  );
}
