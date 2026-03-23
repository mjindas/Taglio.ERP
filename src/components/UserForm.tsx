"use client";

import { useStore, adminPermissions, defaultUserPermissions, UserPermissions, CrudPerm } from "@/store/useStore";
import { useIsAdmin } from "@/hooks/usePermissions";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { User as UserIcon, Mail, Lock, Briefcase, Code, Server, Shield, ChevronDown, Eye, EyeOff, ShieldX } from "lucide-react";

// ── Sections & modules definition ──────────────────────────────────────────
const MASTER_MODULES = [
  { key: "clients",    label: "Client Master" },
  { key: "suppliers",  label: "Supplier Master" },
  { key: "categories", label: "Category Master" },
  { key: "products",   label: "Product Master" },
] as const;

const TXN_MODULES = [
  { key: "quotations",     label: "Quotations" },
  { key: "salesOrders",    label: "Sales Orders" },
  { key: "invoices",       label: "Invoices" },
  { key: "purchaseOrders", label: "Purchase Orders" },
  { key: "receiptNotes",   label: "Receipt Notes" },
] as const;

const OPS: (keyof CrudPerm)[] = ["create", "read", "update", "delete"];

// ── Types ─────────────────────────────────────────────────────────────────
interface UserFormData {
  username: string;
  password: string;
  email: string;
  employeeCode: string;
  employeeName: string;
  role: "Admin" | "User";
  smtp: { host: string; port: number; username: string; password: string; fromEmail: string; fromName: string; useSsl: boolean };
  permissions: UserPermissions;
}

interface Props {
  mode: "create" | "edit";
  initialData?: UserFormData;
  userId?: string;
}

// ── Component ─────────────────────────────────────────────────────────────
export default function UserForm({ mode, initialData, userId }: Props) {
  const router   = useRouter();
  const isAdmin  = useIsAdmin();
  const { addUser, updateUser } = useStore();

  const defaultForm: UserFormData = initialData ?? {
    username: "", password: "", email: "", employeeCode: "", employeeName: "",
    role: "User",
    smtp: { host: "", port: 587, username: "", password: "", fromEmail: "", fromName: "", useSsl: true },
    permissions: defaultUserPermissions(),
  };

  const [form, setForm]       = useState<UserFormData>(defaultForm);
  const [showPwd, setShowPwd] = useState(false);
  const [showSmtp, setShowSmtp] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "permissions" | "smtp">("details");

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
        <ShieldX className="w-14 h-14 text-red-400" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-sm text-gray-500">Only administrators can manage users.</p>
      </div>
    );
  }

  // ── Helpers ──
  const setField = (key: keyof Omit<UserFormData, "smtp" | "permissions">, val: any) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const setSmtp = (key: string, val: any) =>
    setForm(prev => ({ ...prev, smtp: { ...prev.smtp, [key]: val } }));

  const togglePerm = (section: "masters" | "transactions", module: string, op: keyof CrudPerm) => {
    setForm(prev => {
      const perms = prev.permissions as any;
      return {
        ...prev,
        permissions: {
          ...perms,
          [section]: {
            ...perms[section],
            [module]: { ...perms[section][module], [op]: !perms[section][module][op] }
          }
        }
      };
    });
  };

  const setAllForModule = (section: "masters" | "transactions", module: string, val: boolean) => {
    setForm(prev => {
      const perms = prev.permissions as any;
      return {
        ...prev,
        permissions: {
          ...perms,
          [section]: {
            ...perms[section],
            [module]: { create: val, read: val, update: val, delete: val }
          }
        }
      };
    });
  };

  const handleRoleChange = (role: "Admin" | "User") => {
    setForm(prev => ({
      ...prev,
      role,
      permissions: role === "Admin" ? adminPermissions() : defaultUserPermissions(),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "create") {
      addUser(form);
    } else if (userId) {
      updateUser(userId, form);
    }
    router.push("/masters/users");
  };

  // ── Sub-components ──
  const InputField = ({ icon: Icon, label, value, onChange, placeholder, type = "text", required = true, endSlot }: any) => (
    <div className="space-y-1">
      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">{label}</label>
      <div className="relative flex items-center bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
        {Icon && <Icon className="ml-4 w-5 h-5 text-gray-400 shrink-0" />}
        <input required={required} type={type} value={value} onChange={onChange} placeholder={placeholder}
          className="w-full bg-transparent px-4 py-3.5 outline-none text-gray-900 dark:text-white" />
        {endSlot}
      </div>
    </div>
  );

  // Permission grid for a section
  const PermGrid = ({ section, modules }: { section: "masters" | "transactions"; modules: readonly {key: string; label: string}[] }) => (
    <div className="flex flex-col gap-3">
      {modules.map(({ key, label }) => {
        const perm = (form.permissions as any)[section][key] as CrudPerm;
        const allChecked = OPS.every(op => perm[op]);
        return (
          <div key={key} className="bg-gray-50 dark:bg-zinc-900 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{label}</span>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-500">
                <input type="checkbox" checked={allChecked}
                  onChange={(e) => setAllForModule(section, key, e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600" />
                All
              </label>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {OPS.map(op => (
                <label key={op} className={`flex flex-col items-center gap-1 p-2 rounded-xl cursor-pointer text-center transition-colors ${perm[op] ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300" : "bg-white dark:bg-zinc-800 text-gray-500"}`}>
                  <input type="checkbox" checked={perm[op]}
                    onChange={() => togglePerm(section, key, op)}
                    className="sr-only" />
                  <span className="text-[10px] font-bold uppercase">{op.charAt(0)}</span>
                  <span className="text-[9px]">{op}</span>
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="animate-in pt-2 pb-20 flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {mode === "create" ? "Create User" : "Edit User"}
        </h2>
        <p className="text-gray-500 text-sm">
          {mode === "create" ? "Add a new user and configure their access." : "Update user details and permissions."}
        </p>
      </div>

      {/* Tab selector */}
      <div className="flex bg-gray-100 dark:bg-zinc-900 rounded-2xl p-1 gap-1">
        {(["details", "permissions", "smtp"] as const).map(tab => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all capitalize ${
              activeTab === tab ? "bg-white dark:bg-zinc-800 text-indigo-600 shadow-sm" : "text-gray-500"
            }`}>
            {tab === "permissions" ? "🔐 Access" : tab === "smtp" ? "📧 Email" : "👤 Details"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* ── Details Tab ── */}
        {activeTab === "details" && (
          <>
            <div className="glass-card rounded-3xl p-4 shadow-lg flex flex-col gap-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Basic Info</p>

              <InputField icon={UserIcon} label="Employee Name" value={form.employeeName}
                onChange={(e: any) => setField("employeeName", e.target.value)} placeholder="Full Name" />
              <InputField icon={Code} label="Employee Code" value={form.employeeCode}
                onChange={(e: any) => setField("employeeCode", e.target.value)} placeholder="e.g. EMP002" />
              <InputField icon={Mail} label="Email ID" value={form.email} type="email"
                onChange={(e: any) => setField("email", e.target.value)} placeholder="user@company.com" />
            </div>

            <div className="glass-card rounded-3xl p-4 shadow-lg flex flex-col gap-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Login Credentials</p>

              <InputField icon={UserIcon} label="Username" value={form.username}
                onChange={(e: any) => setField("username", e.target.value)} placeholder="Login username" />

              <InputField icon={Lock} label="Password" value={form.password}
                type={showPwd ? "text" : "password"}
                onChange={(e: any) => setField("password", e.target.value)} placeholder="Password"
                endSlot={
                  <button type="button" onClick={() => setShowPwd(v => !v)} className="mr-4 text-gray-400">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                } />
            </div>

            <div className="glass-card rounded-3xl p-4 shadow-lg flex flex-col gap-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Role</p>
              <div className="grid grid-cols-2 gap-3">
                {(["Admin", "User"] as const).map(r => (
                  <button key={r} type="button" onClick={() => handleRoleChange(r)}
                    className={`py-4 rounded-2xl font-bold text-sm border-2 transition-all ${
                      form.role === r
                        ? r === "Admin" ? "border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300"
                                        : "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                        : "border-gray-200 dark:border-zinc-800 text-gray-500 bg-gray-50 dark:bg-zinc-900"
                    }`}>
                    {r === "Admin" ? "👑 Admin" : "👤 User"}
                    <p className="text-[10px] font-normal mt-0.5">{r === "Admin" ? "Full access" : "Limited access"}</p>
                  </button>
                ))}
              </div>
              {form.role === "Admin" && (
                <div className="bg-purple-50 dark:bg-purple-500/5 rounded-xl p-3 text-center">
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                    👑 Admin users have full access to all modules and cannot be restricted.
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Permissions Tab ── */}
        {activeTab === "permissions" && (
          <div className="flex flex-col gap-4">
            {form.role === "Admin" ? (
              <div className="glass-card rounded-3xl p-6 flex flex-col items-center gap-3 text-center">
                <Shield className="w-10 h-10 text-purple-500" />
                <h3 className="font-bold text-gray-900 dark:text-gray-100">Full Access Granted</h3>
                <p className="text-sm text-gray-500">Admin role has full Create, Read, Update and Delete access to all modules automatically.</p>
              </div>
            ) : (
              <>
                <div className="glass-card rounded-3xl p-4 shadow-lg flex flex-col gap-3">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Master Screens</p>
                  <PermGrid section="masters" modules={MASTER_MODULES} />
                </div>
                <div className="glass-card rounded-3xl p-4 shadow-lg flex flex-col gap-3">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Transaction Screens</p>
                  <PermGrid section="transactions" modules={TXN_MODULES} />
                </div>
              </>
            )}
          </div>
        )}

        {/* ── SMTP Tab ── */}
        {activeTab === "smtp" && (
          <div className="glass-card rounded-3xl p-4 shadow-lg flex flex-col gap-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email / SMTP Settings</p>
            <p className="text-xs text-gray-400">Used for sending emails (quotations, invoices) from this user's account.</p>

            <InputField icon={Server} label="SMTP Host" value={form.smtp.host}
              onChange={(e: any) => setSmtp("host", e.target.value)} placeholder="smtp.gmail.com" required={false} />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Port</label>
                <div className="relative flex items-center bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/50">
                  <input type="number" value={form.smtp.port}
                    onChange={(e) => setSmtp("port", Number(e.target.value))} placeholder="587"
                    className="w-full bg-transparent px-4 py-3.5 outline-none text-gray-900 dark:text-white" />
                </div>
              </div>
              <label className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl px-4 cursor-pointer mt-6">
                <input type="checkbox" checked={form.smtp.useSsl}
                  onChange={(e) => setSmtp("useSsl", e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Use SSL/TLS</span>
              </label>
            </div>

            <InputField icon={UserIcon} label="SMTP Username" value={form.smtp.username}
              onChange={(e: any) => setSmtp("username", e.target.value)} placeholder="SMTP login username" required={false} />

            <InputField icon={Lock} label="SMTP Password" value={form.smtp.password} type="password"
              onChange={(e: any) => setSmtp("password", e.target.value)} placeholder="SMTP password" required={false} />

            <InputField icon={Mail} label="From Email" value={form.smtp.fromEmail} type="email"
              onChange={(e: any) => setSmtp("fromEmail", e.target.value)} placeholder="no-reply@company.com" required={false} />

            <InputField icon={Mail} label="From Name" value={form.smtp.fromName}
              onChange={(e: any) => setSmtp("fromName", e.target.value)} placeholder="Taglio ERP" required={false} />
          </div>
        )}

        <button type="submit"
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-indigo-600/30 active:scale-[0.98] transition-all">
          {mode === "create" ? "Create User" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
