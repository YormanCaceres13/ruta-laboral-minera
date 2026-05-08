export const SUPABASE_TABLES = {
  alumnos: process.env.SUPABASE_ALUMNOS_TABLE || "alumnos_ruta_laboral",
  empleos: process.env.SUPABASE_EMPLEOS_TABLE || "empleos_ruta_laboral",
} as const;
