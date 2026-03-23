"use client";

import { useStore } from "@/store/useStore";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Truck, ShieldCheck, MapPin } from "lucide-react";
import { LocationFields } from "@/components/LocationFields";

// Move InputField outside to fix focus loss issues
const InputField = ({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  required = true,
}: any) => (
  <div className="space-y-1">
    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">{label}</label>
    <div className="relative flex items-center bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/50 transition-all">
      {Icon && <Icon className="ml-4 w-5 h-5 text-gray-400 shrink-0" />}
      <input
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-transparent px-4 py-3.5 outline-none text-gray-900 dark:text-white"
      />
    </div>
  </div>
);

export default function AddSupplier() {
  const router = useRouter();
  const addSupplier = useStore((state) => state.addSupplier);

  const [formData, setFormData] = useState({
    name: "",
    mailingName: "",
    gstNumber: "",
    addressLine: "",
    city: "",
    state: "",
    country: "India",
    pinCode: "",
  });

  const handleLocationChange = (field: "country" | "state" | "city", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSupplier(formData);
    router.back();
  };

  const mailingPreview = [formData.addressLine, formData.city, formData.state, formData.country, formData.pinCode]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="animate-in pt-2 pb-16 h-full flex flex-col">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
        <div className="flex flex-col gap-1 mb-1">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Create Supplier</h2>
          <p className="text-gray-500 text-sm">Add a new vendor for inventory purchases.</p>
        </div>

        {/* ── Supplier Details ── */}
        <div className="glass-card rounded-3xl p-4 shadow-lg flex flex-col gap-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Supplier Details</p>

          <InputField icon={Truck} label="Supplier Name" value={formData.name}
            onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Supplier / Vendor Name" />

          <InputField icon={Truck} label="Mailing Name" value={formData.mailingName}
            onChange={(e: any) => setFormData({ ...formData, mailingName: e.target.value })}
            placeholder="Name for purchase orders & letters" />

          <InputField icon={ShieldCheck} label="GST Number" value={formData.gstNumber}
            onChange={(e: any) => setFormData({ ...formData, gstNumber: e.target.value })}
            placeholder="e.g. 07AAACG1234A1Z5" required={false} />
        </div>

        {/* ── Mailing Address ── */}
        <div className="glass-card rounded-3xl p-4 shadow-lg flex flex-col gap-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Mailing Address</p>

          <InputField icon={MapPin} label="Address Line" value={formData.addressLine}
            onChange={(e: any) => setFormData({ ...formData, addressLine: e.target.value })}
            placeholder="Street / Area / Locality" />

          {/* Cascading: dropdowns for India, free-text for others */}
          <LocationFields
            country={formData.country}
            state={formData.state}
            city={formData.city}
            onChange={handleLocationChange}
            accentColor="emerald"
          />

          <InputField icon={null} label="PIN / ZIP Code" value={formData.pinCode}
            onChange={(e: any) => setFormData({ ...formData, pinCode: e.target.value })}
            placeholder="PIN / ZIP Code" />

          {mailingPreview && (
            <div className="bg-emerald-50 dark:bg-emerald-500/5 rounded-xl p-3">
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">
                Mailing Address Preview
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300">{mailingPreview}</p>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="mt-2 w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-emerald-600/30 active:scale-[0.98] transition-all"
        >
          Save Supplier
        </button>
      </form>
    </div>
  );
}
