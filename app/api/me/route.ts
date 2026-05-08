import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { SUPABASE_TABLES } from "@/lib/supabaseTables";

export async function GET() {
  // ✅ En tu Next: cookies() es async
  const cookieStore = await cookies();
  const token = cookieStore.get("rm_session")?.value;

  if (!token) {
    return NextResponse.json({ nombre: null }, { status: 401 });
  }

  try {
    // 1) Leer rut desde JWT (cookie)
    const secret = new TextEncoder().encode(process.env.AUTH_JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);

    const rut = typeof payload.rut === "string" ? payload.rut : null;
    if (!rut) {
      return NextResponse.json({ nombre: null }, { status: 401 });
    }

    // 2) Traer nombre desde Supabase
    const { data, error } = await supabaseAdmin
      .from(SUPABASE_TABLES.alumnos)
      .select("nombre_completo")
      .eq("rut", rut)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      rut,
      nombre: data?.nombre_completo ?? null,
    });
  } catch {
    return NextResponse.json({ nombre: null }, { status: 401 });
  }
}
