"use client";

import { useStore } from "@/store/useStore";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !user && pathname !== "/login") {
      router.replace("/login");
    }
  }, [user, pathname, router, mounted]);

  if (!mounted) return <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center">Loading...</div>;

  if (!user && pathname !== "/login") {
    return null;
  }

  return <>{children}</>;
}
