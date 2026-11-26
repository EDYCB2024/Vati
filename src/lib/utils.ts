import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const GESTION_LABELS: Record<string, string> = {
  servicio_tecnico: "Servicio Técnico",
  desinstalacion: "Desinstalación",
  reconexion: "Reconexión",
  cambio_razon_social: "Cambio de Razón Social",
  traslado: "Traslado de Equipo",
  insumos_consultas: "Insumos y Consultas",
};

export const STATUS_META: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  open: {
    label: "Abierto",
    bg: "bg-secondary-fixed/70",
    text: "text-secondary",
    dot: "bg-secondary",
  },
  bot_handling: {
    label: "Atendido por Vati",
    bg: "bg-primary-fixed/80",
    text: "text-primary",
    dot: "bg-primary",
  },
  waiting_agent: {
    label: "Esperando Agente",
    bg: "bg-amber-100/80",
    text: "text-amber-800",
    dot: "bg-amber-500",
  },
  in_progress: {
    label: "En Progreso",
    bg: "bg-tertiary-fixed/70",
    text: "text-tertiary",
    dot: "bg-tertiary",
  },
  resolved: {
    label: "Resuelto",
    bg: "bg-emerald-100/80",
    text: "text-emerald-800",
    dot: "bg-emerald-500",
  },
  closed: {
    label: "Cerrado",
    bg: "bg-surface-container-high",
    text: "text-on-surface-variant",
    dot: "bg-outline",
  },
};

export const PRIORITY_META: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  low: {
    label: "Baja",
    bg: "bg-surface-container-low",
    text: "text-on-surface-variant",
  },
  medium: {
    label: "Media",
    bg: "bg-secondary-fixed/60",
    text: "text-secondary",
  },
  high: {
    label: "Alta",
    bg: "bg-amber-100/80",
    text: "text-amber-800",
  },
  urgent: {
    label: "Urgente",
    bg: "bg-error-container",
    text: "text-error",
  },
};

export function formatTicketCode(ticketNumber: number) {
  return `VTC-${String(ticketNumber).padStart(4, "0")}`;
}

export function formatRelativeDate(dateInput: string | Date) {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
