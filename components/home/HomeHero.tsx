"use client";

import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  ClipboardCheck,
  FileSearch,
} from "lucide-react";

const quickStats = [
  {
    label: "Empleos publicados",
    icon: BriefcaseBusiness,
  },
  {
    label: "Informacion de postulacion",
    icon: FileSearch,
  },
  {
    label: "Acceso para alumnos",
    icon: ClipboardCheck,
  },
];

export function HomeHero() {
  return (
    <section className="relative overflow-hidden rounded-[22px] border border-[#d7e1ea] bg-[#0e2840] shadow-[0_28px_80px_rgba(14,40,64,0.18)]">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center opacity-28"
        style={{ backgroundImage: "url('/fondo.png')" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(14,40,64,0.96)_0%,rgba(14,40,64,0.88)_43%,rgba(14,40,64,0.48)_100%)]" />

      <div className="relative grid min-h-[340px] gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-10">
        <div className="flex max-w-2xl flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white/80">
            Ruta Laboral Minera
          </div>

          <h1 className="text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            Revisa empleos mineros desde tu perfil de alumno
          </h1>

          <p className="mt-4 max-w-xl text-base leading-7 text-white/78 sm:text-lg">
            Entra con tu RUT para consultar publicaciones laborales, revisar
            detalles de postulacion y acceder a recursos informativos del portal.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/empleos"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#f47c00] px-5 text-sm font-black text-white shadow-[0_16px_36px_rgba(244,124,0,0.32)] transition hover:bg-[#e16f00]"
            >
              Ver empleos
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>

            <a
              href="#noticias"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/16"
            >
              Ver avisos
            </a>
          </div>
        </div>

        <div className="flex items-end">
          <div className="grid w-full gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {quickStats.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-2xl border border-white/14 bg-white/10 p-4 text-white shadow-sm backdrop-blur"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#f47c00] text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-bold leading-5">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
