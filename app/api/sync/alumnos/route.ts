import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { SUPABASE_TABLES } from "@/lib/supabaseTables";

type SheetRow = Record<string, unknown>;

function normalizeDoc(input: unknown) {
  // documento_id: puede ser RUT (26970322-9) o pasaporte (AT501311)
  return String(input ?? "")
    .replace(/\./g, "")
    .replace(/\s+/g, "")
    .toUpperCase()
    .trim();
}

// Normaliza llaves: "Nombre Completo " -> "nombre_completo"
function normalizeKey(k: string) {
  return String(k ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

// Remapea keys raras de Sheets a keys internas esperadas
function normalizeRowKeys(row: SheetRow) {
  const out: SheetRow = {};
  for (const [k, v] of Object.entries(row ?? {})) {
    const nk = normalizeKey(k);

    if (nk === "estado_(activo_/_inactivo)" || nk === "estado_(activo_/inactivo)") {
      out["estado"] = v;
      continue;
    }
    if (nk === "fecha_vencimiento" || nk === "fecha_de_vencimiento") {
      out["fecha_vencimiento"] = v;
      continue;
    }
    if (nk === "nombre_completo" || nk === "nombre") {
      out["nombre_completo"] = v;
      continue;
    }
    if (nk === "cursos" || nk === "curso") {
      out["cursos"] = v;
      continue;
    }
    if (nk === "rut" || nk === "documento" || nk === "documento_id") {
      out["rut"] = v; // mantenemos columna "rut" en DB, pero es documento
      continue;
    }

    out[nk] = v;
  }
  return out;
}

function csvToArray(csv?: unknown) {
  const s = String(csv ?? "").trim();
  if (!s) return [];
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function normalizeEstado(value?: unknown) {
  const s = String(value ?? "").trim().toLowerCase();
  if (!s) return "activo";
  return s.includes("inact") ? "inactivo" : "activo";
}

// Acepta "YYYY-MM-DD" o "dd/mm/yyyy" o "" => null
function normalizeDate(input?: unknown) {
  const s = String(input ?? "").trim();
  if (!s) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) {
    const dd = String(m[1]).padStart(2, "0");
    const mm = String(m[2]).padStart(2, "0");
    const yyyy = m[3];
    return `${yyyy}-${mm}-${dd}`;
  }

  return null;
}

function isValidDocumento(doc: string) {
  // Regla mínima: que exista y tenga un tamaño razonable.
  // NO validamos RUT para permitir pasaportes.
  if (!doc) return false;
  if (doc.length < 5) return false; // evita basura tipo "A"
  if (doc.length > 32) return false; // evita inputs raros
  return true;
}

export async function POST(req: Request) {
  const secret = req.headers.get("x-sync-secret");
  if (!secret || secret !== process.env.SYNC_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { rows?: SheetRow[] };
  const rows = Array.isArray(body?.rows) ? body.rows : [];

  const rejected: Array<{ raw: SheetRow; reason: string }> = [];

  // ✅ Normaliza keys primero
  const payload = rows
    .map((raw) => {
      const r = normalizeRowKeys(raw);

      // documento (rut o pasaporte)
      const doc = normalizeDoc(r.rut);

      if (!isValidDocumento(doc)) {
        rejected.push({ raw, reason: "documento vacío o inválido" });
        return null;
      }

      const nombre = String(r.nombre_completo ?? "").trim();
      const cursosStr = String(r.cursos ?? "").trim();
      const fechaStr = String(r.fecha_vencimiento ?? "").trim();

      return {
        rut: doc, // en DB sigue siendo "rut", pero representa documento
        nombre_completo: nombre ? nombre : null,
        cursos: cursosStr ? csvToArray(cursosStr) : [],
        estado: normalizeEstado(r.estado),
        fecha_vencimiento: normalizeDate(fechaStr),
      };
    })
    .filter(Boolean) as Array<{
      rut: string;
      nombre_completo: string | null;
      cursos: string[];
      estado: string;
      fecha_vencimiento: string | null;
    }>;

  if (payload.length === 0) {
    return NextResponse.json({ ok: true, upserted: 0, rejected });
  }

  // ⚠️ IMPORTANTE: "rut" debe ser UNIQUE en la tabla para que onConflict funcione bien.
  const { data, error } = await supabaseAdmin
    .from(SUPABASE_TABLES.alumnos)
    .upsert(payload, { onConflict: "rut" })
    .select("rut,nombre_completo,cursos,estado,fecha_vencimiento");

  if (error) {
    return NextResponse.json({ ok: false, error: error.message, rejected }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    upserted: payload.length,
    sample: (data ?? []).slice(0, 8),
    rejected,
  });
}
