"use client";

import { useStore } from "@/store/useStore";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, Mail, MapPin, ShieldCheck, User2 } from "lucide-react";
import { LocationFields } from "@/components/LocationFields";

// Move InputField outside to fix focus loss issues
const InputField = ({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = true,
}: any) => (
  <div className="space-y-1">
    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">{label}</label>
    <div className="relative flex items-center bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
      {Icon && <Icon className="ml-4 w-5 h-5 text-gray-400 shrink-0" />}
      <input
        required={required}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-transparent px-4 py-3.5 outline-none text-gray-900 dark:text-white"
      />
    </div>
  </div>
);

export default function AddClient() {
  const router = useRouter();
  const addClient = useStore((state) => state.addClient);

  const [formData, setFormData] = useState({
    name: "",
    mailingName: "",
    phone: "",
    email: "",
    contactPerson: "",
    contactPersonNumber: "",
    gstNumber: "",
    isGstApplicable: true,
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
    addClient(formData);
    router.back();
  };

  const billingPreview = [formData.addressLine, formData.city, formData.state, formData.country, formData.pinCode]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="animate-in pt-2 pb-16 h-full flex flex-col">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
        <div className="flex flex-col gap-1 mb-1">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Create Client</h2>
          <p className="text-gray-500 text-sm">Add a new client to your master data.</p>
        </div>

        {/* ── Client Details ── */}
        <div className="glass-card rounded-3xl p-4 shadow-lg flex flex-col gap-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Client Details</p>

          <InputField icon={User} label="Client Name" value={formData.name}
            onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Client / Company Name" />

          <InputField icon={User} label="Mailing Name" value={formData.mailingName}
            onChange={(e: any) => setFormData({ ...formData, mailingName: e.target.value })}
            placeholder="Name for invoices & letters" />

          <div className="grid grid-cols-2 gap-3">
            <InputField icon={Phone} label="Phone Number" value={formData.phone}
              onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Phone" type="tel" />
            <InputField icon={Mail} label="Email" value={formData.email}
              onChange={(e: any) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email" type="email" />
          </div>
        </div>

        {/* ── Contact Person ── */}
        <div className="glass-card rounded-3xl p-4 shadow-lg flex flex-col gap-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Contact Person</p>
          <div className="grid grid-cols-2 gap-3">
            <InputField icon={User2} label="Person Name" value={formData.contactPerson}
              onChange={(e: any) => setFormData({ ...formData, contactPerson: e.target.value })}
              placeholder="Contact person" required={false} />
            <InputField icon={Phone} label="Person Phone" value={formData.contactPersonNumber}
              onChange={(e: any) => setFormData({ ...formData, contactPersonNumber: e.target.value })}
              placeholder="Phone" type="tel" required={false} />
          </div>
        </div>

        {/* ── GST ── */}
        <div className="glass-card rounded-3xl p-4 shadow-lg flex flex-col gap-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">GST Information</p>

          <label className="flex items-center gap-3 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-3.5 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-colors">
            <input
              type="checkbox"
              checked={formData.isGstApplicable}
              onChange={(e) => setFormData({ ...formData, isGstApplicable: e.target.checked })}
              className="w-5 h-5 rounded text-indigo-600 border-gray-300"
            />
            <div>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">GST Applicable</span>
              <p className="text-[10px] text-gray-500 mt-0.5">Enable if this client is GST registered</p>
            </div>
          </label>

          {formData.isGstApplicable && (
            <InputField icon={ShieldCheck} label="GST Number" value={formData.gstNumber}
              onChange={(e: any) => setFormData({ ...formData, gstNumber: e.target.value })}
              placeholder="e.g. 27AABCU9603R1ZM" required={false} />
          )}
        </div>

        {/* ── Billing Address ── */}
        <div className="glass-card rounded-3xl p-4 shadow-lg flex flex-col gap-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Billing Address</p>

          <InputField icon={MapPin} label="Address Line" value={formData.addressLine}
            onChange={(e: any) => setFormData({ ...formData, addressLine: e.target.value })}
            placeholder="Street / Area / Locality" />

          {/* Cascading: dropdowns for India, free-text for others */}
          <LocationFields
            country={formData.country}
            state={formData.state}
            city={formData.city}
            onChange={handleLocationChange}
            accentColor="indigo"
          />

          <InputField icon={null} label="PIN / ZIP Code" value={formData.pinCode}
            onChange={(e: any) => setFormData({ ...formData, pinCode: e.target.value })}
            placeholder="PIN / ZIP Code" />

          {billingPreview && (
            <div className="bg-indigo-50 dark:bg-indigo-500/5 rounded-xl p-3">
              <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">
                Billing Address Preview
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300">{billingPreview}</p>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="mt-2 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-indigo-600/30 active:scale-[0.98] transition-all"
        >
          Save Client
        </button>
      </form>
    </div>
  );
}
