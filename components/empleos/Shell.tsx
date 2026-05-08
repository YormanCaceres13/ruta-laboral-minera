import type { ReactNode } from "react";
import { Topbar } from "./Topbar";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f7f9] text-[#0e2840]">
      <Topbar />
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">{children}</main>

      <footer className="border-t border-[#dce5ec] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 text-xs text-[#647386] md:px-8">
          (c) {new Date().getFullYear()} Ruta Laboral Minera - Portal de alumnos y empleos.
        </div>
      </footer>
    </div>
  );
}
