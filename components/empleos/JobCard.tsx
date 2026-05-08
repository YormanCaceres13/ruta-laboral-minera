import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  MapPin,
  Timer,
} from "lucide-react";
import type { Job } from "./types";
import { resolveApplicationLink } from "./application-link";

function isClosed(fecha_cierre?: string) {
  if (!fecha_cierre) return false;
  const date = new Date(`${fecha_cierre}T23:59:59`);
  return date.getTime() < Date.now();
}

function daysUntil(fecha_cierre?: string) {
  if (!fecha_cierre) return null;
  const date = new Date(`${fecha_cierre}T23:59:59`);
  const diff = date.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function fallbackSummary(job: Job) {
  const parts: string[] = [];
  if (job.area) parts.push(job.area);
  if (job.turno) parts.push(job.turno);
  if (job.modalidad) parts.push(job.modalidad);
  if (job.region) parts.push(job.region);
  if (job.ubicacion) parts.push(job.ubicacion);
  return parts.filter(Boolean).join(" · ");
}

const pill =
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black";

export function JobCard({ job }: { job: Job }) {
  const cerrado = isClosed(job.fecha_cierre);
  const dleft = daysUntil(job.fecha_cierre);
  const closingSoon = typeof dleft === "number" && dleft >= 0 && dleft <= 3;
  const applicationLink = resolveApplicationLink(job.link_postulacion);
  const hasLink = Boolean(applicationLink.href);

  return (
    <article className="group relative overflow-hidden rounded-[18px] border border-[#dce5ec] bg-white shadow-[0_14px_42px_rgba(14,40,64,0.07)] transition hover:-translate-y-0.5 hover:border-[#f47c00]/40 hover:shadow-[0_20px_58px_rgba(14,40,64,0.12)]">
      <div className="absolute inset-y-0 left-0 w-1.5 bg-[#f47c00]" />
      <div className="p-5 pl-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={[
                  pill,
                  cerrado
                    ? "border-[#dce5ec] bg-[#f3f6f8] text-[#627184]"
                    : "border-[#ffd4a3] bg-[#fff4e8] text-[#c76400]",
                ].join(" ")}
              >
                {cerrado ? "Cerrado" : "Abierto"}
              </span>

              {closingSoon && !cerrado ? (
                <span className={`${pill} border-amber-200 bg-amber-50 text-amber-800`}>
                  Cierra pronto
                </span>
              ) : null}
            </div>

            <h3 className="mt-3 text-xl font-black leading-tight tracking-tight text-[#0e2840]">
              {job.cargo}
            </h3>

            <p className="mt-2 flex items-center gap-2 text-sm font-bold text-[#627184]">
              <Building2 className="h-4 w-4 text-[#f47c00]" />
              {job.empresa || "Empresa no especificada"}
            </p>
          </div>

          <a
            href={applicationLink.href ?? undefined}
            target={hasLink ? "_blank" : undefined}
            rel={hasLink ? "noreferrer" : undefined}
            aria-disabled={!hasLink}
            className={[
              "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-sm font-black transition",
              hasLink
                ? "bg-[#0e2840] text-white hover:bg-[#173b5d] active:scale-[0.98]"
                : "cursor-not-allowed bg-[#eef3f6] text-[#8492a4]",
            ].join(" ")}
          >
            Ver publicacion
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(job.region || job.ubicacion) && (
            <span className={`${pill} border-[#dce5ec] bg-[#f8fafb] text-[#0e2840]`}>
              <MapPin className="h-3.5 w-3.5 text-[#f47c00]" />
              {job.region}
              {job.ubicacion ? ` · ${job.ubicacion}` : ""}
            </span>
          )}
          {job.turno ? (
            <span className={`${pill} border-[#dce5ec] bg-[#f8fafb] text-[#0e2840]`}>
              <Timer className="h-3.5 w-3.5 text-[#f47c00]" />
              {job.turno}
            </span>
          ) : null}
          {job.modalidad ? (
            <span className={`${pill} border-[#dce5ec] bg-[#f8fafb] text-[#0e2840]`}>
              {job.modalidad}
            </span>
          ) : null}
          {job.area ? (
            <span className={`${pill} border-[#dce5ec] bg-[#f8fafb] text-[#0e2840]`}>
              {job.area}
            </span>
          ) : null}
        </div>

        {job.rango_sueldo ? (
          <div className="mt-3">
            <span className={`${pill} border-[#bfe3d6] bg-[#effbf6] text-[#0e7656]`}>
              {job.rango_sueldo}
            </span>
          </div>
        ) : null}

        <p className="mt-4 text-sm leading-7 text-[#4f5f70]">
          {job.descripcion_corta || fallbackSummary(job)}
        </p>

        {job.etiquetas?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {job.etiquetas.slice(0, 6).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#eef3f6] px-3 py-1 text-xs font-bold text-[#627184]"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#edf2f5] pt-4 text-xs font-medium text-[#7a8999]">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 text-[#f47c00]" />
            {job.fecha_cierre ? `Cierra: ${job.fecha_cierre}` : "Sin fecha de cierre"}
          </span>

          {job.fuente ? <span>Fuente: {job.fuente}</span> : null}
        </div>
      </div>
    </article>
  );
}
