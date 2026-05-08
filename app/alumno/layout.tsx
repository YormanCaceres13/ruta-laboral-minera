import type { ReactNode } from "react";
import { Shell } from "@/components/empleos/Shell";

export default function Layout({ children }: { children: ReactNode }) {
  return <Shell>{children}</Shell>;
}
