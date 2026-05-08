"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  ExternalLink,
  FileText,
} from "lucide-react";

import { HomeHero } from "@/components/home/HomeHero";
import { NewsFeed } from "@/components/home/NewsFeed";

const portalItems = [
  {
    title: "Postulacion externa",
    text: "Cada oferta conserva su enlace o medio de contacto original.",
    icon: ExternalLink,
  },
  {
    title: "Datos ordenados",
    text: "Revisa cargo, empresa, ubicacion y requisitos antes de avanzar.",
    icon: FileText,
  },
  {
    title: "Acceso verificado",
    text: "El portal usa tu registro de alumno para habilitar la consulta.",
    icon: BadgeCheck,
  },
];

export default function AlumnoHomePage() {
  return (
    <div className="relative min-h-screen bg-[#f4f7f9]">
      <div className="absolute inset-x-0 top-0 h-64 bg-[linear-gradient(180deg,#eaf2f6_0%,rgba(234,242,246,0)_100%)]" />

      <div className="relative mx-auto max-w-7xl space-y-9 px-4 py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <HomeHero />
        </motion.div>

        <section
          id="noticias"
          className="rounded-[22px] border border-[#dce5ec] bg-white px-5 py-6 shadow-[0_18px_60px_rgba(14,40,64,0.08)] sm:px-6"
        >
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#fff4e8] px-3 py-1 text-xs font-black uppercase tracking-wide text-[#c76400]">
                Avisos del portal
              </div>
              <h2 className="text-2xl font-black tracking-tight text-[#0e2840]">
                Noticias e informacion laboral
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#5d6b7a]">
                Publicaciones y enlaces informativos para revisar novedades del
                rubro minero y procesos difundidos por fuentes externas.
              </p>
            </div>

            <Link
              href="/empleos"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0e2840] px-4 text-sm font-black text-white shadow-sm transition hover:bg-[#173b5d]"
            >
              Buscar empleos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <NewsFeed />
        </section>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]"
        >
          <div className="rounded-[22px] border border-[#dce5ec] bg-[#0e2840] p-6 text-white shadow-[0_18px_60px_rgba(14,40,64,0.14)]">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f47c00]">
              <BriefcaseBusiness className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-2xl font-black tracking-tight">
              Antes de postular
            </h3>
            <p className="mt-3 text-sm leading-7 text-white/76">
              Revisa siempre las condiciones del cargo y confirma que el enlace
              o contacto corresponda a la fuente indicada en la publicacion.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {portalItems.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-[18px] border border-[#dce5ec] bg-white p-5 shadow-[0_14px_42px_rgba(14,40,64,0.07)]"
                >
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#fff4e8] text-[#f47c00]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="mt-4 text-base font-black text-[#0e2840]">
                    {item.title}
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-[#5d6b7a]">
                    {item.text}
                  </p>
                </article>
              );
            })}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
