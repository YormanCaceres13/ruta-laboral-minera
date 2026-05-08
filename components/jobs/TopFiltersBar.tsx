"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// ✅ IMPORTANTÍSIMO: value debe coincidir con lo que existe en tu DB (empleos.region)
const REGIONES = [
  { value: "", label: "Todas las regiones" },
  { value: "I Región de Tarapacá", label: "I Región de Tarapacá" },
  { value: "II Región de Antofagasta", label: "II Región de Antofagasta" },
  { value: "III Región de Atacama", label: "III Región de Atacama" },
  { value: "IV Región de Coquimbo", label: "IV Región de Coquimbo" },
  { value: "V Región de Valparaíso", label: "V Región de Valparaíso" },
  { value: "VI Región del Libertador General Bernardo O'Higgins", label: "VI Región del Libertador General Bernardo O'Higgins" },
  { value: "VII Región del Maule", label: "VII Región del Maule" },
  { value: "VIII Región del Biobío", label: "VIII Región del Biobío" },
  { value: "IX Región de La Araucanía", label: "IX Región de La Araucanía" },
  { value: "X Región de Los Lagos", label: "X Región de Los Lagos" },
  { value: "XI Región de Aysén del General Carlos Ibáñez del Campo", label: "XI Región de Aysén del General Carlos Ibáñez del Campo" },
  { value: "XIV Región de Los Ríos", label: "XIV Región de Los Ríos" },
  { value: "XVI Región de Ñuble", label: "XVI Región de Ñuble" },
] as const;

// ✅ Debe coincidir con tu Sheet/DB (ej: 4x3 existe)
const TURNOS = [
  { value: "", label: "Todos" },
  { value: "7x7", label: "7x7" },
  { value: "4x3", label: "4x3" },
  { value: "5x2", label: "5x2" },
  { value: "14x14", label: "14x14" },
] as const;

// ✅ Debe coincidir EXACTO con tu DB (incluye “Seguridad / Prevención”, etc.)
const AREAS = [
  { value: "", label: "Todas" },
  { value: "Operaciones", label: "Operaciones" },
  { value: "Mantenimiento", label: "Mantenimiento" },
  { value: "Seguridad / Prevención", label: "Seguridad / Prevención" },
  { value: "Administración", label: "Administración" },
  { value: "Supervisión", label: "Supervisión" },
] as const;

type Props = {
  q: string;
  region: string;
  turno: string;
  area: string;
  onChange: (patch: Partial<Props>) => void;
  onClear: () => void;
};

export function TopFiltersBar(props: Props) {
  const clearQuickFilters = () => {
    props.onChange({ region: "", turno: "", area: "" });
  };

  return (
    <div className="rounded-2xl border bg-background p-4 shadow-sm">
      <div className="flex flex-col gap-3">
        {/* Búsqueda */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            value={props.q}
            onChange={(e) => props.onChange({ q: e.target.value })}
            placeholder='Buscar cargo, empresa o keyword (ej: "CAEX", "licencia D")'
          />
          <div className="flex gap-2 sm:shrink-0">
            <Button variant="secondary" onClick={props.onClear}>
              Limpiar
            </Button>
            <Button variant="outline" onClick={clearQuickFilters}>
              Reset filtros
            </Button>
          </div>
        </div>

        {/* Filtros rápidos */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {/* Región */}
          <Select value={props.region} onValueChange={(v) => props.onChange({ region: v })}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Región" />
            </SelectTrigger>
            <SelectContent>
              {REGIONES.map((r) => (
                <SelectItem key={r.label} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Turno */}
          <Select value={props.turno} onValueChange={(v) => props.onChange({ turno: v })}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Turno" />
            </SelectTrigger>
            <SelectContent>
              {TURNOS.map((t) => (
                <SelectItem key={t.label} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Área */}
          <Select value={props.area} onValueChange={(v) => props.onChange({ area: v })}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Área" />
            </SelectTrigger>
            <SelectContent>
              {AREAS.map((a) => (
                <SelectItem key={a.label} value={a.value}>
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
