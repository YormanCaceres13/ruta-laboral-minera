"use client";

import Image from "next/image";
import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BriefcaseBusiness,
  Eye,
  EyeOff,
  FileText,
  IdCard,
  Lock,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

function normalizeRut(input: string) {
  return input.replace(/\./g, "").replace(/\s+/g, "").toUpperCase().trim();
}

const benefits = [
  {
    title: "Ofertas disponibles",
    description: "Revisa empleos publicados para perfiles mineros",
    icon: BriefcaseBusiness,
  },
  {
    title: "Datos de postulacion",
    description: "Consulta requisitos, ubicacion y detalles del cargo",
    icon: FileText,
  },
  {
    title: "Perfil de alumno",
    description: "Ingresa con tu RUT para ver informacion asociada",
    icon: UserCheck,
  },
  {
    title: "Acceso protegido",
    description: "Ingreso reservado para alumnos registrados",
    icon: ShieldCheck,
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [rut, setRut] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPass, setShowPass] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          rut: normalizeRut(rut),
          password: normalizeRut(password),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "Error al iniciar sesion");
      }

      router.push("/alumno");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030507] text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center bg-no-repeat lg:bg-[position:center_center]"
        style={{ backgroundImage: "url('/fondo.png')" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.88)_0%,rgba(255,255,255,0.66)_24%,rgba(0,0,0,0.04)_48%,rgba(0,0,0,0.18)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_24%,rgba(255,255,255,0.46),transparent_28%),linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.48)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/18 to-transparent" />

      <section className="relative z-10 flex min-h-screen flex-col px-5 py-6 sm:px-8 lg:px-12">
        <header className="flex w-full max-w-[620px] items-center gap-4 sm:gap-6">
          <Image
            src="/logo.png"
            alt="Ruta Laboral Minera"
            width={190}
            height={96}
            className="h-auto w-40 object-contain sm:w-48"
            priority
          />
          <div className="hidden h-16 w-px bg-[#0e2840]/25 sm:block" />
          <p className="max-w-48 text-base font-medium leading-snug text-[#0e2840] sm:text-lg">
            Tu ruta hacia{" "}
            <span className="font-bold text-[#f47c00]">
              nuevas oportunidades
            </span>{" "}
            en mineria
          </p>
        </header>

        <div className="flex flex-1 items-center py-8 lg:py-10">
          <form
            onSubmit={onSubmit}
            className="w-full max-w-[470px] rounded-[18px] border border-white/65 bg-white/93 px-6 py-7 shadow-[0_28px_80px_rgba(0,0,0,0.52)] backdrop-blur-md sm:px-10 sm:py-10"
          >
            <div>
              <h1 className="text-3xl font-black tracking-tight text-[#071c36] sm:text-4xl">
                Iniciar sesion
              </h1>
              <p className="mt-3 text-sm font-medium text-[#5c6d81] sm:text-base">
                Ingresa a tu cuenta para continuar
              </p>
            </div>

            <div className="mt-8 space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="rut"
                  className="text-sm font-bold uppercase text-[#111827]"
                >
                  RUT
                </label>
                <div className="flex h-14 items-center gap-3 rounded-xl border border-[#d4dce7] bg-white px-4 shadow-[0_8px_22px_rgba(7,28,54,0.08)] transition focus-within:border-[#f47c00] focus-within:ring-4 focus-within:ring-[#f47c00]/15">
                  <IdCard className="h-5 w-5 shrink-0 text-[#8796aa]" />
                  <input
                    id="rut"
                    value={rut}
                    onChange={(e) => setRut(e.target.value)}
                    placeholder="Ej: 12.345.678-9"
                    autoComplete="username"
                    className="min-w-0 flex-1 bg-transparent text-base font-medium text-[#0e2840] outline-none placeholder:text-[#93a0b3]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-bold text-[#111827]"
                >
                  Contrasena
                </label>
                <div className="flex h-14 items-center gap-3 rounded-xl border border-[#d4dce7] bg-white px-4 shadow-[0_8px_22px_rgba(7,28,54,0.08)] transition focus-within:border-[#f47c00] focus-within:ring-4 focus-within:ring-[#f47c00]/15">
                  <Lock className="h-5 w-5 shrink-0 text-[#8796aa]" />
                  <input
                    id="password"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tu RUT como contrasena"
                    autoComplete="current-password"
                    className="min-w-0 flex-1 bg-transparent text-base font-medium text-[#0e2840] outline-none placeholder:text-[#93a0b3]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    aria-label={
                      showPass ? "Ocultar contrasena" : "Mostrar contrasena"
                    }
                    className="rounded-lg p-1.5 text-[#111827] transition hover:bg-[#edf2f7]"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-7 flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#f47c00] px-5 text-base font-bold text-white shadow-[0_14px_32px_rgba(244,124,0,0.3)] transition hover:bg-[#e16f00] disabled:cursor-not-allowed disabled:opacity-65"
            >
              {loading ? "Ingresando..." : "Iniciar sesion"}
              <ArrowRight size={20} />
            </button>

            <div className="mt-8 flex items-center gap-5 text-sm text-[#7b8999]">
              <div className="h-px flex-1 bg-[#dbe2ea]" />
              <span>acceso con RUT</span>
              <div className="h-px flex-1 bg-[#dbe2ea]" />
            </div>
          </form>
        </div>

        <div className="grid w-full gap-0 overflow-hidden rounded-[18px] border border-white/15 bg-black/62 shadow-[0_24px_70px_rgba(0,0,0,0.46)] backdrop-blur-md sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <div
                key={benefit.title}
                className="flex min-h-28 items-center gap-4 px-6 py-5 text-white lg:min-h-24"
              >
                <Icon className="h-9 w-9 shrink-0 text-[#f47c00]" />
                <div
                  className={
                    index > 0
                      ? "border-t border-white/15 pt-5 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0"
                      : ""
                  }
                >
                  <h2 className="text-base font-black">{benefit.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-white/68">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
