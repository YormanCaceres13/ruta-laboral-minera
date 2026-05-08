"use client";

import * as React from "react";
import { SlidersHorizontal } from "lucide-react";
import type { Filters } from "./types";

type Props = {
  value: Filters;
  onChange: (next: Filters) => void;
};

const REGIONES = [
  { value: "", label: "Todas" },
  { value: "tarapaca", label: "I Region de Tarapaca" },
  { value: "antofagasta", label: "II Region de Antofagasta" },
  { value: "atacama", label: "III Region de Atacama" },
  { value: "coquimbo", label: "IV Region de Coquimbo" },
  { value: "valparaiso", label: "V Region de Valparaiso" },
  { value: "ohiggins", label: "VI Region de O'Higgins" },
  { value: "maule", label: "VII Region del Maule" },
  { value: "biobio", label: "VIII Region del Biobio" },
  { value: "araucania", label: "IX Region de La Araucania" },
  { value: "los-lagos", label: "X Region de Los Lagos" },
  { value: "aysen", label: "XI Region de Aysen" },
  { value: "los-rios", label: "XIV Region de Los Rios" },
  { value: "nuble", label: "XVI Region de Nuble" },
] as const;

const TURNOS = ["7x7", "4x3", "5x2", "14x14"] as const;

const AREAS = [
  "Operaciones",
  "Mantenimiento",
  "Seguridad / Prevencion",
  "Administracion",
  "Supervision",
] as const;

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase tracking-wide text-[#627184]">
        {label}
      </label>
      {children}
    </div>
  );
}

export function FiltersSidebar({ value, onChange }: Props) {
  const activeCount =
    (value.region ? 1 : 0) +
    (value.turno ? 1 : 0) +
    (value.area ? 1 : 0);

  const clearAll = React.useCallback(() => {
    onChange({
      ...value,
      region: "",
      turno: "",
      area: "",
    });
  }, [onChange, value]);

  const set = (patch: Partial<Filters>) => onChange({ ...value, ...patch });

  const selectClass =
    "h-12 w-full rounded-xl border border-[#dce5ec] bg-white px-3 text-sm font-medium text-[#0e2840] shadow-sm transition focus:outline-none focus:ring-4 focus:ring-[#f47c00]/12 focus:border-[#f47c00]";

  return (
    <aside className="overflow-hidden rounded-[18px] border border-[#dce5ec] bg-white shadow-[0_14px_42px_rgba(14,40,64,0.07)]">
      <div className="border-b border-[#dce5ec] bg-[#f8fafb] px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff4e8] text-[#f47c00] ring-1 ring-[#ffd4a3]">
              <SlidersHorizontal className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-sm font-black tracking-tight text-[#0e2840]">
                Filtros
              </h2>
              <p className="mt-1 text-xs text-[#7a8999]">
                {activeCount === 0
                  ? "Sin filtros aplicados"
                  : `${activeCount} filtro(s) activo(s)`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={clearAll}
            disabled={activeCount === 0}
            className="rounded-xl border border-[#dce5ec] bg-white px-3 py-2 text-xs font-black text-[#627184] shadow-sm transition hover:bg-[#fff4e8] hover:text-[#0e2840] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="space-y-5 p-4">
        <Field label="Region">
          <select
            value={value.region}
            onChange={(e) => set({ region: e.target.value })}
            className={selectClass}
          >
            {REGIONES.map((r) => (
              <option key={r.value || "all"} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Turno">
          <select
            value={value.turno}
            onChange={(e) => set({ turno: e.target.value })}
            className={selectClass}
          >
            <option value="">Todos</option>
            {TURNOS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Area">
          <select
            value={value.area}
            onChange={(e) => set({ area: e.target.value })}
            className={selectClass}
          >
            <option value="">Todas</option>
            {AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </Field>

        <div className="rounded-xl border border-[#dce5ec] bg-[#f8fafb] p-3">
          <p className="text-xs leading-5 text-[#627184]">
            Este portal muestra ofertas publicadas. Al postular, se abrira la
            fuente o contacto indicado por la publicacion.
          </p>
        </div>
      </div>
    </aside>
  );
}
