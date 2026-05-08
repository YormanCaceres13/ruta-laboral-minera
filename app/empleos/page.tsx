"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Funnel, Loader2 } from "lucide-react";
import type { Filters, Job } from "@/components/empleos/types";

import { Topbar } from "@/components/empleos/Topbar";
import { FiltersSidebar } from "@/components/empleos/FiltersSidebar";
import { JobsList } from "@/components/empleos/JonsList";
import { TopSearchBar } from "@/components/jobs/TopSearchBar";
import { PromoCarousel } from "@/components/jobs/PromoCarousel";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function FilterChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#dce5ec] bg-white px-3 py-1 text-[11px] font-black text-[#627184]">
      {children}
    </span>
  );
}

export default function EmpleosPage() {
  const [filters, setFilters] = useState<Filters>({
    q: "",
    region: "",
    turno: "",
    area: "",
    estado: "todos",
  });

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { q, region, turno, area, estado } = filters;

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (region) p.set("region", region);
    if (turno) p.set("turno", turno);
    if (area) p.set("area", area);
    if (estado) p.set("estado", estado);
    return p.toString();
  }, [q, region, turno, area, estado]);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/empleos?${qs}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json?.error ?? "Error cargando empleos");

        setJobs(json.jobs ?? []);
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Error desconocido cargando empleos");
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, [qs]);

  const clearOnlySearch = useCallback(() => {
    setFilters((prev) => ({ ...prev, q: "" }));
  }, []);

  const hasFilters = Boolean(region || turno || area);

  return (
    <div className="min-h-screen bg-[#f4f7f9] text-[#0e2840]">
      <Topbar />

      <div className="border-b border-[#dce5ec] bg-white/60">
        <div className="mx-auto max-w-7xl px-4 py-5 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 inline-flex rounded-full bg-[#fff4e8] px-3 py-1 text-[11px] font-black uppercase tracking-wide text-[#c76400] ring-1 ring-[#ffd4a3]">
                Bolsa laboral
              </div>
              <h1 className="text-3xl font-black tracking-tight text-[#0e2840]">
                Empleos
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {loading ? (
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-[#627184]">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#f47c00]" />
                    Cargando resultados
                  </span>
                ) : (
                  <span className="text-xs font-bold text-[#627184]">
                    Resultados:{" "}
                    <span className="font-black text-[#0e2840]">{jobs.length}</span>
                  </span>
                )}

                {hasFilters ? (
                  <>
                    {region ? <FilterChip>Region</FilterChip> : null}
                    {turno ? <FilterChip>Turno</FilterChip> : null}
                    {area ? <FilterChip>Area</FilterChip> : null}
                  </>
                ) : (
                  <FilterChip>Sin filtros</FilterChip>
                )}
              </div>
            </div>

            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#dce5ec] bg-white px-4 text-sm font-black text-[#0e2840] shadow-sm"
                  >
                    <Funnel className="h-4 w-4 text-[#f47c00]" />
                    Filtros
                  </button>
                </SheetTrigger>

                <SheetContent side="left" className="w-[92vw] p-0 sm:w-[420px]">
                  <SheetHeader className="border-b border-[#dce5ec] px-4 py-4">
                    <SheetTitle>Filtros</SheetTitle>
                  </SheetHeader>

                  <div className="p-3">
                    <FiltersSidebar value={filters} onChange={setFilters} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8">
        <div className="grid gap-6 md:grid-cols-[300px_1fr]">
          <aside className="hidden md:block md:sticky md:top-28 md:h-[calc(100vh-8rem)] md:overflow-auto">
            <FiltersSidebar value={filters} onChange={setFilters} />
          </aside>

          <section className="min-w-0 space-y-4">
            {error ? (
              <div className="rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {error}
              </div>
            ) : null}

            <TopSearchBar
              q={q}
              onChange={(nextQ) => setFilters((prev) => ({ ...prev, q: nextQ }))}
              onClear={clearOnlySearch}
            />

            <PromoCarousel />

            <JobsList jobs={jobs} />
          </section>
        </div>
      </main>
    </div>
  );
}
