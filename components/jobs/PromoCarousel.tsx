"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import { BadgeCheck, FileText, Lock, Search } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

type Slide = {
  title: string;
  body: string;
  badge: string;
  icon: React.ReactNode;
};

const slides: Slide[] = [
  {
    badge: "Como funciona",
    title: "Postula en la fuente indicada",
    body:
      "Aqui reunimos publicaciones laborales. Al abrir una oferta, revisa el enlace o contacto oficial para continuar el proceso.",
    icon: <BadgeCheck className="h-5 w-5" />,
  },
  {
    badge: "Busqueda",
    title: "Usa palabras clave especificas",
    body:
      'Prueba con cargo, equipo, licencia, turno o empresa: "CAEX", "licencia D", "7x7", "mantenimiento".',
    icon: <Search className="h-5 w-5" />,
  },
  {
    badge: "Antes de postular",
    title: "Ten tus antecedentes preparados",
    body:
      "Revisa tu CV, certificaciones, experiencia y disponibilidad antes de avanzar hacia la publicacion.",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    badge: "Seguridad",
    title: "Cuida tus datos personales",
    body:
      "No compartas claves ni realices pagos por postular. Verifica siempre la informacion de la empresa.",
    icon: <Lock className="h-5 w-5" />,
  },
];

export function PromoCarousel() {
  const plugin = React.useRef(
    Autoplay({
      delay: 11000,
      stopOnInteraction: false,
      stopOnMouseEnter: false,
    })
  );

  return (
    <section aria-label="Informacion importante" className="w-full">
      <Carousel
        plugins={[plugin.current]}
        opts={{ loop: true, align: "start" }}
        className="w-full"
      >
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.title} className="basis-full">
              <div className="relative overflow-hidden rounded-[18px] border border-[#bfe3d6] bg-[linear-gradient(110deg,#effbf6_0%,#ffffff_58%,#edf6fa_100%)] p-5 shadow-[0_14px_42px_rgba(14,40,64,0.07)] md:p-7">
                <div className="absolute right-0 top-0 h-full w-48 bg-[radial-gradient(circle_at_35%_25%,rgba(244,124,0,0.16),transparent_34%),radial-gradient(circle_at_70%_60%,rgba(14,40,64,0.12),transparent_36%)]" />

                <div className="relative grid gap-5 md:grid-cols-[1fr_260px] md:items-center">
                  <div className="flex items-start gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#fff4e8] text-[#f47c00] ring-1 ring-[#ffd4a3]">
                      {slide.icon}
                    </span>

                    <div>
                      <span className="inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-wide text-[#0e7656] ring-1 ring-[#bfe3d6]">
                        {slide.badge}
                      </span>
                      <h3 className="mt-3 text-lg font-black tracking-tight text-[#0e2840]">
                        {slide.title}
                      </h3>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#627184]">
                        {slide.body}
                      </p>
                    </div>
                  </div>

                  <div className="hidden h-32 overflow-hidden rounded-2xl border border-[#dce5ec] bg-white shadow-sm md:block">
                    <div
                      className="h-full w-full bg-cover bg-center opacity-75"
                      style={{ backgroundImage: "url('/fondo.png')" }}
                    />
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
