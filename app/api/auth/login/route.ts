import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { SUPABASE_TABLES } from "@/lib/supabaseTables";

function normalizeDoc(input: string) {
  return String(input ?? "")
    .replace(/\./g, "")
    .replace(/\s+/g, "")
    .toUpperCase()
    .trim();
}

// Detecta si "parece" RUT chileno: 7-8 dígitos + "-" + DV
function looksLikeRut(doc: string) {
  return /^(\d{7,8})-([0-9K])$/.test(doc);
}

// Valida DV con Módulo 11 (solo si parece RUT)
function isValidRut(rutRaw: string) {
  const rut = normalizeDoc(rutRaw);
  const m = rut.match(/^(\d{7,8})-([0-9K])$/);
  if (!m) return false;

  const body = m[1];
  const dv = m[2];

  let sum = 0;
  let mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]!, 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const res = 11 - (sum % 11);
  const dvCalc = res === 11 ? "0" : res === 10 ? "K" : String(res);
  return dvCalc === dv;
}

// Documento genérico (pasaporte, DNI, etc)
function isValidDocumento(doc: string) {
  if (!doc) return false;
  if (doc.length < 5) return false; // evita basura
  if (doc.length > 32) return false; // evita inputs raros
  // Si quieres endurecer (opcional): solo letras/números/guion
  // if (!/^[A-Z0-9-]+$/.test(doc)) return false;
  return true;
}

// Fecha vencida si exp <= hoy (solo por día). Null => nunca vence
function isExpired(exp: unknown) {
  if (!exp) return false;

  const s = String(exp);
  let expDate: Date | null = null;

  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    expDate = new Date(y, mo - 1, d);
  } else {
    const d2 = new Date(s);
    if (!Number.isNaN(d2.getTime())) expDate = d2;
  }

  if (!expDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  expDate.setHours(0, 0, 0, 0);

  return expDate.getTime() <= today.getTime();
}

export async function POST(req: Request) {
  try {
    const { rut, password } = await req.json();

    const docN = normalizeDoc(String(rut ?? ""));
    const passN = normalizeDoc(String(password ?? ""));

    // ✅ Regla de negocio: password = documento (mismo valor)
    // (dejamos esto tal cual)
    if (passN !== docN) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    // ✅ Validación mínima SIEMPRE (aplica a RUT o pasaporte)
    // IMPORTANTE: NO bloqueamos por DV, porque tu objetivo es "si está guardado, entra".
    if (!isValidDocumento(docN)) {
      return NextResponse.json({ error: "Documento inválido" }, { status: 400 });
    }

    // ✅ Buscar por documento (columna rut en DB)
    const { data, error } = await supabaseAdmin
      .from(SUPABASE_TABLES.alumnos)
      .select("rut, nombre_completo, estado, fecha_vencimiento")
      .eq("rut", docN)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "No estás registrado" }, { status: 401 });
    }

    // ✅ Control opcional (NO bloqueante):
    // si parece RUT y el DV no cuadra, solo lo registramos para corregir luego en Sheets.
    if (looksLikeRut(docN) && !isValidRut(docN)) {
      console.warn("Documento parece RUT pero DV inválido (NO bloquea login):", docN);
    }

    if ((data.estado ?? "").toLowerCase() === "inactivo") {
      return NextResponse.json(
        { error: "Tu cuenta está inactiva. Contacta a tu asesora para reactivarla." },
        { status: 403 }
      );
    }

    if (isExpired(data.fecha_vencimiento)) {
      return NextResponse.json(
        { error: "Tu acceso ha expirado. Contacta a tu asesora para renovar tu acceso." },
        { status: 403 }
      );
    }

    const secret = new TextEncoder().encode(process.env.AUTH_JWT_SECRET!);

    const token = await new SignJWT({
      rut: data.rut, // aquí es documento
      nombre: data.nombre_completo ?? "",
      role: "alumno",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    const res = NextResponse.json({ ok: true });

    res.cookies.set("rm_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
