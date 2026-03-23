import { useStore } from "@/store/useStore";
import type { CrudPerm, UserPermissions } from "@/store/useStore";

type ModuleKey    = keyof UserPermissions["masters"] | keyof UserPermissions["transactions"];
type SectionKey   = "masters" | "transactions";
type Operation    = keyof CrudPerm;

/** Returns the CRUD permission block for a module, or all-false if not found. */
export function useModulePermission(section: SectionKey, module: string): CrudPerm {
  const user = useStore((s) => s.user);
  if (!user) return { create: false, read: false, update: false, delete: false };
  if (user.role === "Admin") return { create: true, read: true, update: true, delete: true };
  const perms = user.permissions[section] as Record<string, CrudPerm>;
  return perms[module] ?? { create: false, read: false, update: false, delete: false };
}

/** Quick single-op check */
export function useCan(section: SectionKey, module: string, op: Operation): boolean {
  const perm = useModulePermission(section, module);
  return perm[op];
}

/** True if the logged-in user is Admin */
export function useIsAdmin(): boolean {
  return useStore((s) => s.user?.role === "Admin");
}
