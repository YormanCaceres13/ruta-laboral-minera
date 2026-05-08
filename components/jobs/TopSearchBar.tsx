"use client";

import { Search, X } from "lucide-react";

type Props = {
  q: string;
  onChange: (q: string) => void;
  onClear: () => void;
};

export function TopSearchBar({ q, onChange, onClear }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-[18px] border border-[#dce5ec] bg-white p-3 shadow-[0_14px_42px_rgba(14,40,64,0.07)] sm:flex-row">
      <div className="flex min-h-12 flex-1 items-center gap-3 rounded-xl border border-[#dce5ec] bg-[#f8fafb] px-4 transition focus-within:border-[#f47c00] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#f47c00]/10">
        <Search className="h-5 w-5 shrink-0 text-[#7a8999]" />
        <input
          value={q}
          onChange={(e) => onChange(e.target.value)}
          placeholder='Buscar cargo, empresa o palabra clave (ej: "CAEX", "licencia D")'
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#0e2840] outline-none placeholder:text-[#8492a4]"
        />
      </div>

      <button
        type="button"
        onClick={onClear}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#eef3f6] px-5 text-sm font-black text-[#0e2840] transition hover:bg-[#e4edf2]"
      >
        <X className="h-4 w-4" />
        Limpiar
      </button>
    </div>
  );
}
