"use client";

import { SearchX } from "lucide-react";
import type { Job } from "./types";
import { JobCard } from "./JobCard";

function jobKey(job: Job, idx: number) {
  if (job.id) return String(job.id);
  if (job.link_postulacion) return `${job.link_postulacion}__${idx}`;
  return `${job.cargo ?? ""}|${job.empresa ?? ""}|${job.fecha_publicacion ?? ""}|${idx}`;
}

export function JobsList({ jobs }: { jobs: Job[] }) {
  if (!jobs.length) {
    return (
      <div className="rounded-[18px] border border-[#dce5ec] bg-white p-9 text-center shadow-[0_14px_42px_rgba(14,40,64,0.07)]">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#fff4e8] text-[#f47c00] ring-1 ring-[#ffd4a3]">
          <SearchX className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-base font-black text-[#0e2840]">
          No hay resultados
        </h3>
        <p className="mt-1 text-sm text-[#627184]">
          Prueba ajustando filtros o cambiando la busqueda.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {jobs.map((job, idx) => (
        <JobCard key={jobKey(job, idx)} job={job} />
      ))}
    </div>
  );
}
