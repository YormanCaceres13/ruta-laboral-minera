export type Job = {
  id: number;

  cargo: string;
  empresa: string;

  region: string;
  ubicacion?: string;

  turno?: string;
  modalidad?: string;
  area?: string;

  etiquetas: string[];

  link_postulacion: string;
  fuente?: string;

  rango_sueldo?: string;
  descripcion_corta?: string;

  fecha_publicacion?: string; // YYYY-MM-DD
  fecha_cierre?: string; // YYYY-MM-DD
  estado?: string; // publicado/pausado/cerrado
};

export type Filters = {
  q: string;
  region: string;
  turno: string;
  area: string;
  estado: "todos" | "abierto" | "cerrado";
};
