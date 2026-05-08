import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { SUPABASE_TABLES } from "@/lib/supabaseTables";

function formatCLP(n?: number | null) {
  if (!n) return null;
  return n.toLocaleString("es-CL");
}

/**
 * Normaliza el input del usuario para que matchee con search_text (idealmente ya normalizado en DB).
 * - lower
 * - sin tildes
 * - limpia símbolos raros
 * - colapsa espacios
 */
function normSearchInput(s: string) {
  return s
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ");
}

/**
 * Normaliza strings para comparar: minúsculas, sin tildes, sin símbolos raros.
 */
function norm(s: string) {
  return s
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, " ");
}

const REGION_CANON = [
  { slug: "tarapaca", label: "I Región de Tarapacá" },
  { slug: "antofagasta", label: "II Región de Antofagasta" },
  { slug: "atacama", label: "III Región de Atacama" },
  { slug: "coquimbo", label: "IV Región de Coquimbo" },
  { slug: "valparaiso", label: "V Región de Valparaíso" },
  { slug: "ohiggins", label: "VI Región del Libertador General Bernardo O'Higgins" },
  { slug: "maule", label: "VII Región del Maule" },
  { slug: "biobio", label: "VIII Región del Biobío" },
  { slug: "araucania", label: "IX Región de La Araucanía" },
  { slug: "los-lagos", label: "X Región de Los Lagos" },
  { slug: "aysen", label: "XI Región de Aysén del General Carlos Ibáñez del Campo" },
  { slug: "los-rios", label: "XIV Región de Los Ríos" },
  { slug: "nuble", label: "XVI Región de Ñuble" },
] as const;

type JobRow = {
  sueldo_min?: number | null;
  [key: string]: unknown;
};

function normalizeRegion(input: string) {
  if (!input) return "";
  const n = norm(input);

  for (const r of REGION_CANON) if (norm(r.label) === n) return r.label;
  for (const r of REGION_CANON) if (norm(r.slug) === n) return r.label;

  for (const r of REGION_CANON) {
    const slugN = norm(r.slug);
    const labelN = norm(r.label);

    if (n.includes(slugN)) return r.label;
    const keyword = slugN.replace(/-/g, " ");
    if (n.includes(keyword)) return r.label;

    if (labelN.includes(n) || n.includes(labelN)) return r.label;
  }

  return input.trim();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const qRaw = searchParams.get("q")?.trim() || "";
  const q = qRaw ? normSearchInput(qRaw) : "";

  const regionRaw = searchParams.get("region")?.trim() || "";
  const turno = searchParams.get("turno")?.trim() || "";
  const area = searchParams.get("area")?.trim() || "";
  const estado = (searchParams.get("estado")?.trim() || "todos").toLowerCase();

  const region = normalizeRegion(regionRaw);

  let query = supabaseAdmin
    .from(SUPABASE_TABLES.empleos)
    .select("*")
    .order("fecha_publicacion", { ascending: false });

  // Estado
  if (estado === "todos") {
    query = query.or("estado.is.null,estado.neq.inactivo");
  } else {
    query = query.eq("estado", estado);
  }

  // Filtros exactos
  if (region) query = query.eq("region", region);
  if (turno) query = query.eq("turno", turno);
  if (area) query = query.eq("area", area);

  // ✅ Búsqueda total (lo que sea): SOLO search_text
  // search_text debe incluir cargo/empresa/region/ubicacion/turno/modalidad/area/fuente/descripcion/rango/etiquetas
  if (q) {
    query = query.ilike("search_text", `%${q}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      {
        error: error.message,
        debug: {
          qRaw,
          qNormalized: q,
          regionRaw,
          regionNormalized: region,
          turno,
          area,
          estado,
        },
      },
      { status: 500 }
    );
  }

  const jobs = ((data ?? []) as JobRow[]).map((j) => ({
    ...j,
    rango_sueldo_label: j?.sueldo_min ? `Desde $${formatCLP(j.sueldo_min)}` : null,
  }));

  return NextResponse.json({
    jobs,
    debug: {
      qRaw,
      qNormalized: q,
      regionRaw,
      regionNormalized: region,
      count: jobs.length,
    },
  });
}
