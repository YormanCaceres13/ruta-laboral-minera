"use client";

import { usePathname } from "next/navigation";
import { Topbar } from "@/components/empleos/Topbar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideTopbar = pathname === "/login";

  return (
    <>
      {!hideTopbar ? <Topbar /> : null}
      {children}
    </>
  );
}