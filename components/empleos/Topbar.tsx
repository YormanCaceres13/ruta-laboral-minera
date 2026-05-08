"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  Briefcase,
  Home as HomeIcon,
  LogOut,
  Menu,
  Sparkles,
  X,
} from "lucide-react";

type TopbarProps = {
  onOpenFilters?: () => void;
};

export function Topbar({ onOpenFilters }: TopbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let alive = true;

    async function loadUser() {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });

        if (!alive) return;
        if (!res.ok) {
          setNombre(null);
          return;
        }

        const data = await res.json();
        setNombre(typeof data?.nombre === "string" ? data.nombre : null);
      } catch {
        if (alive) setNombre(null);
      }
    }

    loadUser();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  async function handleLogout() {
    if (loading) return;

    setLoading(true);

    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("No se pudo cerrar sesion");

      setMenuOpen(false);
      router.replace("/login");
    } catch (error) {
      console.error(error);
      alert("Error al cerrar sesion. Intenta nuevamente.");
      setLoading(false);
    }
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  function DesktopNavItem({
    href,
    label,
    icon,
  }: {
    href: string;
    label: string;
    icon: ReactNode;
  }) {
    const active = isActive(href);

    return (
      <Link
        href={href}
        className={[
          "group relative inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-black transition",
          active
            ? "text-[#0e2840]"
            : "text-[#627184] hover:bg-[#f6f9fb] hover:text-[#0e2840]",
        ].join(" ")}
      >
        <span
          className={[
            "inline-flex h-8 w-8 items-center justify-center rounded-lg border bg-white shadow-sm transition",
            active
              ? "border-[#ffd4a3] text-[#f47c00]"
              : "border-[#dce5ec] text-[#7a8999] group-hover:text-[#0e2840]",
          ].join(" ")}
        >
          {icon}
        </span>

        <span>{label}</span>

        <span
          className={[
            "pointer-events-none absolute -bottom-[6px] left-3 right-3 h-[2px] rounded-full transition-all duration-200",
            active
              ? "bg-[#f47c00] opacity-100"
              : "scale-x-75 bg-[#f47c00] opacity-0",
          ].join(" ")}
        />
      </Link>
    );
  }

  function MobileItem({
    href,
    label,
    icon,
  }: {
    href: string;
    label: string;
    icon: ReactNode;
  }) {
    const active = isActive(href);

    return (
      <Link
        href={href}
        onClick={() => setMenuOpen(false)}
        className={[
          "flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm transition",
          active
            ? "border-[#ffd4a3] bg-[#fff4e8] text-[#0e2840]"
            : "border-[#dce5ec] bg-white text-[#0e2840] hover:bg-[#f8fafb]",
        ].join(" ")}
      >
        <span
          className={[
            "grid h-10 w-10 place-items-center rounded-xl border bg-white",
            active
              ? "border-[#ffd4a3] text-[#f47c00]"
              : "border-[#dce5ec] text-[#627184]",
          ].join(" ")}
        >
          {icon}
        </span>

        <div className="flex-1">
          <div className="text-sm font-black">{label}</div>
          <div className="text-xs text-[#7a8999]">
            {active ? "Estas aqui" : "Abrir seccion"}
          </div>
        </div>

        <span
          className={[
            "h-2 w-2 rounded-full",
            active ? "bg-[#f47c00]" : "bg-[#dce5ec]",
          ].join(" ")}
        />
      </Link>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#dce5ec] bg-white/88 backdrop-blur supports-[backdrop-filter]:bg-white/78">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link
            href="/alumno"
            className="group flex items-center gap-4 rounded-2xl px-1 py-1 transition hover:bg-[#f8fafb]"
          >
            <Image
              src="/logo.png"
              alt="Ruta Laboral Minera"
              width={180}
              height={92}
              className="h-12 w-24 object-contain sm:h-14 sm:w-32 md:h-16 md:w-36"
              priority
            />

            <div className="leading-tight">
              <div className="text-sm font-black tracking-tight text-[#0e2840] md:text-base">
                Ruta Laboral Minera
              </div>
              <div className="text-xs text-[#647386]">
                Portal de alumnos y empleos
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2 md:gap-3">
            <nav className="hidden items-center gap-2 md:flex">
              <DesktopNavItem
                href="/alumno"
                label="Inicio"
                icon={<HomeIcon className="h-4 w-4" />}
              />

              <DesktopNavItem
                href="/empleos"
                label="Empleos"
                icon={<Briefcase className="h-4 w-4" />}
              />
            </nav>

            <span className="hidden items-center gap-2 rounded-full border border-[#dce5ec] bg-white px-3 py-2 text-xs text-[#627184] shadow-sm md:inline-flex">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#fff4e8] text-[#f47c00] ring-1 ring-[#ffd4a3]">
                <Sparkles className="h-4 w-4" />
              </span>

              {nombre ? (
                <>
                  Hola,{" "}
                  <span className="font-black text-[#0e2840]">{nombre}</span>
                </>
              ) : (
                "Hola"
              )}
            </span>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="inline-flex items-center justify-center rounded-xl border border-[#dce5ec] bg-white px-3 py-2 text-sm font-bold shadow-sm transition hover:bg-[#f8fafb] md:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {onOpenFilters ? (
              <button
                type="button"
                onClick={onOpenFilters}
                className="rounded-xl border border-[#dce5ec] bg-white px-3 py-2 text-sm font-bold shadow-sm transition hover:bg-[#f8fafb] md:hidden"
              >
                Filtros
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleLogout}
              disabled={loading}
              className="hidden items-center gap-2 rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-black text-rose-700 shadow-sm transition hover:bg-rose-50 disabled:opacity-60 md:inline-flex"
            >
              <LogOut className="h-4 w-4" />
              {loading ? "Cerrando..." : "Cerrar sesion"}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[9999] h-dvh w-screen md:hidden">
          <button
            type="button"
            className="absolute inset-0 h-full w-full bg-[#0e2840]/68 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            aria-label="Cerrar fondo del menu"
          />

          <aside className="fixed right-0 top-0 z-[10000] flex h-dvh w-[88vw] max-w-[360px] flex-col overflow-hidden rounded-l-[26px] bg-white shadow-2xl">
            <div className="shrink-0 border-b border-[#dce5ec] bg-[#f8fafb] px-5 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-black text-[#0e2840]">Menu</div>
                  <div className="text-xs text-[#7a8999]">
                    Navegacion rapida
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="grid h-11 w-11 place-items-center rounded-2xl border border-[#dce5ec] bg-white text-[#0e2840] shadow-sm"
                  aria-label="Cerrar menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-white px-5 py-5">
              <div className="rounded-3xl border border-[#dce5ec] bg-[#f8fafb] p-4 shadow-sm">
                <div className="text-xs text-[#7a8999]">Sesion</div>
                <div className="mt-1 text-sm font-black text-[#0e2840]">
                  {nombre ? `Hola, ${nombre}` : "Hola"}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <MobileItem
                  href="/alumno"
                  label="Inicio"
                  icon={<HomeIcon className="h-5 w-5" />}
                />

                <MobileItem
                  href="/empleos"
                  label="Empleos"
                  icon={<Briefcase className="h-5 w-5" />}
                />
              </div>

              <div className="mt-5 rounded-3xl border border-[#ffd4a3] bg-[#fff4e8] p-5 shadow-sm">
                <div className="text-sm font-black text-[#0e2840]">
                  Ruta Laboral Minera
                </div>
                <p className="mt-1 text-xs leading-5 text-[#6f5b45]">
                  Consulta empleos y avisos desde tu cuenta de alumno.
                </p>
              </div>
            </div>

            <div className="shrink-0 border-t border-[#dce5ec] bg-white p-5">
              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-black text-rose-700 shadow-sm transition hover:bg-rose-100 disabled:opacity-60"
              >
                <LogOut className="h-5 w-5" />
                {loading ? "Cerrando..." : "Cerrar sesion"}
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
