export type ApplicationLinkKind =
  | "email"
  | "whatsapp"
  | "phone"
  | "web"
  | "unknown";

export type ResolvedApplicationLink = {
  href: string | null;
  kind: ApplicationLinkKind;
  label: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const HTTP_REGEX = /^https?:\/\//i;
const MAILTO_REGEX = /^mailto:/i;
const TEL_REGEX = /^tel:/i;
const WHATSAPP_SCHEME_REGEX = /^whatsapp:/i;

function normalizePhoneDigits(value: string) {
  return value.replace(/[^\d]/g, "");
}

function normalizeWhatsappHref(value: string) {
  const trimmed = value.trim();

  if (HTTP_REGEX.test(trimmed)) return trimmed;

  if (WHATSAPP_SCHEME_REGEX.test(trimmed)) {
    const raw = trimmed.replace(WHATSAPP_SCHEME_REGEX, "");
    const digits = normalizePhoneDigits(raw);
    return digits ? `https://wa.me/${digits}` : null;
  }

  const digits = normalizePhoneDigits(trimmed);
  return digits ? `https://wa.me/${digits}` : null;
}

export function resolveApplicationLink(rawValue?: string | null): ResolvedApplicationLink {
  const value = String(rawValue ?? "").trim();

  if (!value) {
    return { href: null, kind: "unknown", label: "Sin enlace disponible" };
  }

  if (MAILTO_REGEX.test(value)) {
    return { href: value, kind: "email", label: "Enviar correo" };
  }

  if (TEL_REGEX.test(value)) {
    return { href: value, kind: "phone", label: "Llamar" };
  }

  if (
    WHATSAPP_SCHEME_REGEX.test(value) ||
    /wa\.me\//i.test(value) ||
    /api\.whatsapp\.com/i.test(value) ||
    /whatsapp\.com/i.test(value)
  ) {
    return {
      href: normalizeWhatsappHref(value),
      kind: "whatsapp",
      label: "Abrir WhatsApp",
    };
  }

  if (EMAIL_REGEX.test(value)) {
    return { href: `mailto:${value}`, kind: "email", label: "Enviar correo" };
  }

  if (/^\+?\d[\d\s()-]{7,}$/.test(value)) {
    const digits = normalizePhoneDigits(value);
    return {
      href: digits ? `https://wa.me/${digits}` : null,
      kind: "whatsapp",
      label: "Abrir WhatsApp",
    };
  }

  if (HTTP_REGEX.test(value)) {
    return { href: value, kind: "web", label: "Ver publicación y postular" };
  }

  if (/^www\./i.test(value)) {
    return { href: `https://${value}`, kind: "web", label: "Ver publicación y postular" };
  }

  if (/^[a-z][a-z\d+\-.]*:/i.test(value)) {
    return { href: value, kind: "web", label: "Abrir enlace" };
  }

  return { href: `https://${value}`, kind: "web", label: "Ver publicación y postular" };
}
