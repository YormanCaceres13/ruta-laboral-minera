export type NewsAttachment = {
  label: string;
  url: string;
};

export type NewsPost = {
  id: string;
  tag: "Aviso" | "Seguridad" | "CV" | "Proceso" | "Evento";
  title: string;
  excerpt: string;
  dateLabel: string;
  cover?: string;
  attachments?: NewsAttachment[];
};

export const NEWS: NewsPost[] = [
  {
    id: "minera-codelco-antofagasta-contratacion",
    tag: "Aviso",
    title: "Codelco abre 12 nuevos puestos en Antofagasta",
    excerpt:
      "La estatal Codelco inició un nuevo proceso de contratación con 12 vacantes en la región de Antofagasta para reforzar sus divisiones mineras.",
    dateLabel: "25 Febrero 2026",

    // ✅ IMAGEN LOCAL
    cover: "/noticias/1.png",

    attachments: [
      {
        label: "Ver detalle en El Nortero",
        url: "https://www.elnortero.cl/noticia/economia/codelco-abre-12-puestos-en-la-region-de-antofagasta-para-reforzar-sus-divisiones-mi",
      },
    ],
  },
  {
    id: "finning-chile-abre-puestos",
    tag: "Proceso",
    title: "Finning abre 14 puestos para operaciones mineras",
    excerpt:
      "La empresa Finning Chile activó un proceso de contratación para 14 nuevos puestos de trabajo.",
    dateLabel: "19 Febrero 2026",

    // ✅ IMAGEN LOCAL
    cover: "/noticias/2.png",

    attachments: [
      {
        label: "Ver en El Rancahuaso",
        url: "https://www.elrancahuaso.cl/noticia/economia/finning-abre-14-puestos-de-trabajo-en-chile-para-fortalecer-operaciones-mineras-rev",
      },
    ],
  },
  {
    id: "sierra-gorda-scm-reclutamiento",
    tag: "Evento",
    title: "Sierra Gorda SCM inicia reclutamiento minero",
    excerpt:
      "La minera Sierra Gorda SCM lanzó una nueva etapa de reclutamiento con 10 puestos habilitados.",
    dateLabel: "24 Febrero 2026",

    // ✅ IMAGEN LOCAL
    cover: "/noticias/3.png",

    attachments: [
      {
        label: "Leer noticia completa",
        url: "https://www.elmorrocotudo.cl/noticia/economia/sierra-gorda-scm-abre-10-nuevos-puestos-y-lanza-reclutamiento-minero-en-el-norte-re",
      },
    ],
  },
  {
    id: "mercado-minero-empleo-chile",
    tag: "Seguridad",
    title: "Mercado laboral minero en Chile muestra dinamismo",
    excerpt:
      "La minería impulsa altos niveles de formalidad en el empleo y genera nuevas oportunidades laborales.",
    dateLabel: "25 Febrero 2026",

    // ✅ IMAGEN LOCAL
    cover: "/noticias/4.png",

    attachments: [
      {
        label: "Ver análisis laboral minero",
        url: "https://www.timeline.cl/ccm-eleva-desmitifica-pugna-entre-trabajadores-locales-y-conmutados-en-antofagasta-incluso-reemplazandolos-seguirian-faltando-miles-de-trabajadores/",
      },
    ],
  },
];