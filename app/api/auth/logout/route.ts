import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });

  // 🔥 Elimina la cookie de sesión (ajusta el nombre si usas otro)
  res.cookies.set({
    name: "session",
    value: "",
    path: "/",
    expires: new Date(0), // fuerza expiración
  });

  return res;
}
