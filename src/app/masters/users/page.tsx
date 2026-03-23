"use client";

import { useStore } from "@/store/useStore";
import { useIsAdmin } from "@/hooks/usePermissions";
import { Plus, UserCircle2, Mail, Briefcase, ShieldCheck, ShieldX, Trash2, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const MODULE_LABELS: Record<string, string> = {
  clients: "Client", suppliers: "Supplier", categories: "Category",
  products: "Product", users: "User",
  quotations: "Quotation", salesOrders: "Sales Order", invoices: "Invoice",
  purchaseOrders: "Purchase Order", receiptNotes: "Receipt Note",
};

export default function UserMasterPage() {
  const router  = useRouter();
  const isAdmin = useIsAdmin();
  const { users, deleteUser, user: me } = useStore();

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
        <ShieldX className="w-14 h-14 text-red-400" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Access Denied</h2>
        <p className="text-sm text-gray-500">Only Administrators can manage users.</p>
      </div>
    );
  }

  const handleDelete = (id: string, username: string) => {
    if (id === "U1") return alert("Cannot delete the primary admin account.");
    if (confirm(`Delete user "${username}"?`)) deleteUser(id);
  };

  const permSummary = (u: typeof users[0]) => {
    const all = [
      ...Object.entries(u.permissions.masters),
      ...Object.entries(u.permissions.transactions),
    ];
    const granted = all.filter(([, p]) => p.create || p.update || p.delete).map(([k]) => MODULE_LABELS[k] ?? k);
    return granted.length === 0 ? "Read-only" : granted.join(", ");
  };

  return (
    <div className="flex flex-col gap-4 animate-in pb-16">
      <div className="flex justify-between items-center bg-white/50 border border-gray-100 dark:border-zinc-800 dark:bg-zinc-900/50 p-4 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">User Master</h2>
          <p className="text-sm text-gray-500">{users.length} user{users.length !== 1 ? "s" : ""} configured</p>
        </div>
        <Link href="/masters/users/create"
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl p-3 shadow-lg shadow-indigo-500/30 transition-transform active:scale-90">
          <Plus className="w-5 h-5" />
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {users.map((u) => (
          <div key={u.id} className="glass-card p-4 rounded-2xl flex flex-col gap-3">
            {/* Header */}
            <div className="flex gap-3 items-center border-b border-gray-100 dark:border-zinc-800 pb-3">
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl">
                {u.employeeName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">{u.employeeName}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.role === "Admin" ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300" : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"}`}>
                    {u.role}
                  </span>
                  {u.id === me?.id && (
                    <span className="text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300 px-2 py-0.5 rounded-full">You</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate">@{u.username} · {u.employeeCode}</p>
              </div>
              {/* Actions */}
              <div className="flex gap-2 shrink-0">
                <button onClick={() => router.push(`/masters/users/${u.id}/edit`)}
                  className="p-2 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 active:scale-90 transition-transform">
                  <Pencil className="w-4 h-4" />
                </button>
                {u.id !== "U1" && (
                  <button onClick={() => handleDelete(u.id, u.username)}
                    className="p-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 active:scale-90 transition-transform">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 gap-1.5 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="truncate">{u.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{u.employeeName} ({u.employeeCode})</span>
              </div>
              {u.role === "Admin" ? (
                <div className="flex items-center gap-2 mt-1">
                  <ShieldCheck className="w-4 h-4 text-purple-500 shrink-0" />
                  <span className="text-purple-600 dark:text-purple-400 font-semibold text-xs">Full Access — All Modules</span>
                </div>
              ) : (
                <div className="mt-1 bg-gray-50 dark:bg-zinc-900 rounded-xl p-2">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Write Access To</p>
                  <p className="text-xs text-gray-700 dark:text-gray-300">{permSummary(u)}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
