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

  const body = (await req.json()) as { rows?: EmpleoRow[]; fullSync?: boolean };
  const rows = Array.isArray(body?.rows) ? body.rows : [];
  const fullSync = body?.fullSync === true;

  const rawPayload = rows
    .map((r) => {
      const link = normReq(r.link_postulacion);
      const cargo = normReq(r.cargo);

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
        fecha_publicacion: normText(r.fecha_publicacion),
        fecha_cierre: normText(r.fecha_cierre),
        estado: String(r.estado ?? "publicado").trim().toLowerCase(),
      };
    })
    .filter((r) => r.cargo && r.link_postulacion);

  const payload = dedupeByLink(rawPayload);

  if (payload.length === 0) {
    return NextResponse.json({ ok: true, upserted: 0, deactivated: 0 });
  }

  // 1) UPSERT (solo escribe/actualiza lo que viene del sheet)
  const { error: upsertError } = await supabaseAdmin
    .from(SUPABASE_TABLES.empleos)
    .upsert(payload, { onConflict: "link_postulacion" });

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  if (!fullSync) {
    return NextResponse.json({ ok: true, upserted: payload.length, deactivated: 0 });
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

  return NextResponse.json({ ok: true, upserted: payload.length, deactivated });
}

// para que no devuelva HTML si lo visitas
export async function GET() {
  return NextResponse.json({ ok: true, hint: "POST rows to sync empleos" });
}
