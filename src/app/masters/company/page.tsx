"use client";

import { useStore } from "@/store/useStore";
import { useIsAdmin } from "@/hooks/usePermissions";
import { useState } from "react";
import { Building2, Phone, Mail, Globe, ShieldCheck, MapPin, Calendar, Pencil, Save, X, ShieldX } from "lucide-react";
import { LocationFields } from "@/components/LocationFields";

export default function CompanyMasterPage() {
  const isAdmin          = useIsAdmin();
  const companyInfo      = useStore((s) => s.companyInfo);
  const updateCompanyInfo = useStore((s) => s.updateCompanyInfo);

  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({ ...companyInfo });

  const f = (key: keyof typeof form, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyInfo(form);
    setEditing(false);
  };

  const handleCancel = () => {
    setForm({ ...companyInfo });
    setEditing(false);
  };

  const InputField = ({ icon: Icon, label, value, onChange, placeholder, type = "text", readOnly = false }: any) => (
    <div className="space-y-1">
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">{label}</label>
      <div className={`relative flex items-center bg-gray-50 dark:bg-zinc-900 border rounded-2xl overflow-hidden transition-all ${
        readOnly ? "border-gray-100 dark:border-zinc-800 opacity-60" : "border-gray-200 dark:border-zinc-800 focus-within:ring-2 focus-within:ring-indigo-500/50"
      }`}>
        {Icon && <Icon className="ml-4 w-5 h-5 text-gray-400 shrink-0" />}
        <input readOnly={readOnly} type={type} value={value} onChange={onChange} placeholder={placeholder}
          className="w-full bg-transparent px-4 py-3.5 outline-none text-gray-900 dark:text-white" />
      </div>
    </div>
  );

  const InfoRow = ({ icon: Icon, label, value }: any) => (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 dark:border-zinc-800 last:border-0">
      <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mt-0.5 break-words">{value || "—"}</p>
      </div>
    </div>
  );

  const billingAddress = [companyInfo.addressLine, companyInfo.city, companyInfo.state, companyInfo.country, companyInfo.pinCode].filter(Boolean).join(", ");

  return (
    <div className="animate-in pt-2 pb-16 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Company Master</h2>
          <p className="text-sm text-gray-500">View and update your company information</p>
        </div>
        {isAdmin && !editing && (
          <button onClick={() => setEditing(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/30 active:scale-95 transition-transform">
            <Pencil className="w-4 h-4" /> Edit
          </button>
        )}
      </div>

      {/* View Mode */}
      {!editing && (
        <>
          {/* Company Card */}
          <div className="glass-card rounded-3xl p-5 shadow-lg">
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-zinc-800">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-500/30">
                {companyInfo.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{companyInfo.name}</h3>
                <p className="text-sm text-gray-500">{companyInfo.mailingName}</p>
                <span className="text-xs bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold mt-1 inline-block">
                  Code: {companyInfo.code}
                </span>
              </div>
            </div>

            <InfoRow icon={ShieldCheck} label="GSTIN"         value={companyInfo.gstin} />
            <InfoRow icon={ShieldCheck} label="PAN"           value={companyInfo.pan} />
            <InfoRow icon={Phone}       label="Phone"         value={companyInfo.phone} />
            <InfoRow icon={Mail}        label="Email"         value={companyInfo.email} />
            <InfoRow icon={Globe}       label="Website"       value={companyInfo.website} />
            <InfoRow icon={MapPin}      label="Address"       value={billingAddress} />
            <InfoRow icon={Calendar}    label="Financial Year Starts" value={companyInfo.financialYearStart} />
          </div>

          {!isAdmin && (
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-500/5 rounded-2xl p-3 border border-amber-200 dark:border-amber-500/20">
              <ShieldX className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400">Only administrators can edit company information.</p>
            </div>
          )}
        </>
      )}

      {/* Edit Mode */}
      {editing && (
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {/* Identity */}
          <div className="glass-card rounded-3xl p-4 shadow-lg flex flex-col gap-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Company Identity</p>

            <InputField icon={Building2} label="Company Name" value={form.name}
              onChange={(e: any) => f("name", e.target.value)} placeholder="Full legal name" />
            <InputField icon={Building2} label="Mailing Name" value={form.mailingName}
              onChange={(e: any) => f("mailingName", e.target.value)} placeholder="Name for correspondence" />
            <InputField icon={null} label="Company Code" value={form.code}
              onChange={(e: any) => f("code", e.target.value)} placeholder="e.g. TAGLIO" readOnly={true} />
          </div>

          {/* Tax */}
          <div className="glass-card rounded-3xl p-4 shadow-lg flex flex-col gap-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tax Registration</p>
            <InputField icon={ShieldCheck} label="GSTIN" value={form.gstin}
              onChange={(e: any) => f("gstin", e.target.value)} placeholder="e.g. 27AABCT1234A1Z5" />
            <InputField icon={ShieldCheck} label="PAN" value={form.pan}
              onChange={(e: any) => f("pan", e.target.value)} placeholder="e.g. AABCT1234A" />
          </div>

          {/* Contact */}
          <div className="glass-card rounded-3xl p-4 shadow-lg flex flex-col gap-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Contact Info</p>
            <InputField icon={Phone} label="Phone" value={form.phone}
              onChange={(e: any) => f("phone", e.target.value)} placeholder="Phone number" />
            <InputField icon={Mail} label="Email" value={form.email} type="email"
              onChange={(e: any) => f("email", e.target.value)} placeholder="info@company.com" />
            <InputField icon={Globe} label="Website" value={form.website}
              onChange={(e: any) => f("website", e.target.value)} placeholder="www.company.com" />
          </div>

          {/* Address */}
          <div className="glass-card rounded-3xl p-4 shadow-lg flex flex-col gap-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Registered Address</p>
            <InputField icon={MapPin} label="Address Line" value={form.addressLine}
              onChange={(e: any) => f("addressLine", e.target.value)} placeholder="Street / Area / Plot" />
            <LocationFields country={form.country} state={form.state} city={form.city}
              onChange={(field, val) => f(field, val)} accentColor="indigo" />
            <InputField icon={null} label="PIN Code" value={form.pinCode}
              onChange={(e: any) => f("pinCode", e.target.value)} placeholder="PIN / ZIP Code" />
          </div>

          {/* Financial Year */}
          <div className="glass-card rounded-3xl p-4 shadow-lg flex flex-col gap-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Financial Settings</p>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Financial Year Starts</label>
              <div className="relative flex items-center bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/50">
                <Calendar className="ml-4 w-5 h-5 text-gray-400 shrink-0" />
                <select value={form.financialYearStart} onChange={(e) => f("financialYearStart", e.target.value)}
                  className="w-full bg-transparent px-4 py-3.5 outline-none text-gray-900 dark:text-white appearance-none">
                  {["January","February","March","April","May","June","July","August","September","October","November","December"].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button type="button" onClick={handleCancel}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 font-bold active:scale-95 transition-all">
              <X className="w-5 h-5" /> Cancel
            </button>
            <button type="submit"
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg shadow-indigo-600/30 active:scale-95 transition-all">
              <Save className="w-5 h-5" /> Save
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
