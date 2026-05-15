import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { SUPABASE_TABLES } from "@/lib/supabaseTables";

type EmpleoRow = {
  cargo: string;
  empresa?: string;
  region?: string;
  ubicacion?: string;
  turno?: string;
  modalidad?: string;
  area?: string;
  etiquetas?: string;
  link_postulacion: string;
  fuente?: string;
  rango_sueldo?: string | number; // en sheet ideal número
  descripcion_corta?: string;
  fecha_publicacion?: string; // YYYY-MM-DD
  fecha_cierre?: string; // YYYY-MM-DD
  estado?: string; // publicado | cerrado | inactivo
};

type SheetRow = Record<string, unknown>;

function normalizeKey(k: string) {
  return String(k ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeRowKeys(row: SheetRow): Partial<EmpleoRow> {
  const out: SheetRow = {};

  for (const [k, v] of Object.entries(row ?? {})) {
    const nk = normalizeKey(k);

    if (nk === "postulacion" || nk === "link" || nk === "url" || nk === "url_postulacion") {
      out.link_postulacion = v;
      continue;
    }
    if (nk === "link_de_postulacion" || nk === "link_postulacion") {
      out.link_postulacion = v;
      continue;
    }
    if (nk === "sueldo" || nk === "rango_salarial" || nk === "renta") {
      out.rango_sueldo = v;
      continue;
    }
    if (nk === "sueldo_min" || nk === "sueldo_minimo" || nk === "rango_sueldo") {
      out.rango_sueldo = v;
      continue;
    }
    if (nk === "descripcion" || nk === "descripcion_corta" || nk === "detalle") {
      out.descripcion_corta = v;
      continue;
    }
    if (nk === "fecha_de_publicacion" || nk === "fecha_publicacion") {
      out.fecha_publicacion = v;
      continue;
    }
    if (nk === "fecha_de_cierre" || nk === "fecha_cierre") {
      out.fecha_cierre = v;
      continue;
    }

    out[nk] = v;
  }

  return out as Partial<EmpleoRow>;
}

function csvToArray(csv?: string) {
  if (!csv) return [];
  return String(csv)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function normText(v: unknown): string | null {
  const s = String(v ?? "").trim();
  return s ? s : null;
}

function normReq(v: unknown): string {
  return String(v ?? "").trim();
}

function normDate(v: unknown): string | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;

  const dd = m[1].padStart(2, "0");
  const mm = m[2].padStart(2, "0");
  return `${m[3]}-${mm}-${dd}`;
}

/** Convierte "1400000", "$1.400.000", "CLP 1400000" -> 1400000 */
function normMoneyToInt(v: unknown): number | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const digits = s.replace(/[^\d]/g, "");
  if (!digits) return null;
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
}

/** Dedup por link_postulacion (evita ON CONFLICT ... second time) */
function dedupeByLink<T extends { link_postulacion: string }>(items: T[]) {
  const map = new Map<string, T>();
  for (const it of items) map.set(it.link_postulacion, it);
  return Array.from(map.values());
}

export async function POST(req: Request) {
  const secret = req.headers.get("x-sync-secret");
  if (!secret || secret !== process.env.SYNC_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as { rows?: SheetRow[]; fullSync?: boolean };
  const rows = Array.isArray(body?.rows) ? body.rows : [];
  const fullSync = body?.fullSync === true;
  const rejected: Array<{ raw: SheetRow; reason: string }> = [];

  const rawPayload = rows
    .map((raw) => {
      const r = normalizeRowKeys(raw);
      const link = normReq(r.link_postulacion);
      const cargo = normReq(r.cargo);

      if (!cargo || !link) {
        rejected.push({
          raw,
          reason: !cargo && !link ? "cargo y link_postulacion vacios" : !cargo ? "cargo vacio" : "link_postulacion vacio",
        });
        return null;
      }

      return {
        cargo,
        empresa: normText(r.empresa),
        region: normText(r.region),
        ubicacion: normText(r.ubicacion),
        turno: normText(r.turno),
        modalidad: normText(r.modalidad),
        area: normText(r.area),
        etiquetas: csvToArray(r.etiquetas), // si tu columna es text[] en Supabase, ok
        link_postulacion: link,
        fuente: normText(r.fuente),
        // guardamos sueldo_min como numero (la asesora pone solo el número en rango_sueldo)
        sueldo_min: normMoneyToInt(r.rango_sueldo),
        descripcion_corta: normText(r.descripcion_corta),
        fecha_publicacion: normDate(r.fecha_publicacion),
        fecha_cierre: normDate(r.fecha_cierre),
        estado: String(r.estado ?? "publicado").trim().toLowerCase(),
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  const payload = dedupeByLink(rawPayload);

  if (payload.length === 0) {
    return NextResponse.json({ ok: true, upserted: 0, deactivated: 0, rejected });
  }

  // 1) UPSERT (solo escribe/actualiza lo que viene del sheet)
  const { error: upsertError } = await supabaseAdmin
    .from(SUPABASE_TABLES.empleos)
    .upsert(payload, { onConflict: "link_postulacion" });

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message, rejected }, { status: 500 });
  }

  if (!fullSync) {
    return NextResponse.json({ ok: true, upserted: payload.length, deactivated: 0, rejected });
  }

  // 2) Soft delete: lo que NO venga del Sheet completo -> estado='inactivo'
  // (evita limpiar filas físicamente y te protege contra borrados accidentales)
  const incoming = new Set(payload.map((p) => p.link_postulacion));

  const { data: allLinks, error: linksError } = await supabaseAdmin
    .from(SUPABASE_TABLES.empleos)
    .select("link_postulacion");

  if (linksError) {
    return NextResponse.json(
      { error: "Upsert OK pero falló lectura para desactivar: " + linksError.message },
      { status: 500 }
    );
  }

  const toDeactivate =
    (allLinks ?? [])
      .map((x) => x.link_postulacion as string)
      .filter((link) => link && !incoming.has(link));

  let deactivated = 0;
  if (toDeactivate.length > 0) {
    const { error: deactError } = await supabaseAdmin
      .from(SUPABASE_TABLES.empleos)
      .update({ estado: "inactivo" })
      .in("link_postulacion", toDeactivate);

    if (deactError) {
      return NextResponse.json(
        { error: "Upsert OK pero falló desactivación: " + deactError.message },
        { status: 500 }
      );
    }
    deactivated = toDeactivate.length;
  }

  return NextResponse.json({ ok: true, upserted: payload.length, deactivated, rejected });
}

// para que no devuelva HTML si lo visitas
export async function GET() {
  return NextResponse.json({ ok: true, hint: "POST rows to sync empleos" });
}
