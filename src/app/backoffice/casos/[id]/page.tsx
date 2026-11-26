"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Cpu,
  Loader2,
  Mail,
  Phone,
  Send,
  Sparkles,
  User,
} from "lucide-react";
import {
  cn,
  formatRelativeDate,
  formatTicketCode,
  GESTION_LABELS,
  PRIORITY_META,
  STATUS_META,
} from "@/lib/utils";

interface CaseDetail {
  id: string;
  ticketNumber: number;
  gestionType: string;
  subCategory: string | null;
  subject: string;
  deviceModel: string | null;
  status: string;
  priority: string;
  metadata: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    companyName: string | null;
    documentId: string | null;
    phone: string | null;
    email: string | null;
  };
}

interface CaseMessage {
  id: string;
  senderType: "customer" | "bot" | "agent" | "system";
  senderName: string | null;
  content: string;
  createdAt: string;
}

function CaseDetailContent() {
  const params = useParams<{ id: string }>();
  const caseId = params.id;

  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [messages, setMessages] = useState<CaseMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);

  async function loadDetail() {
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}`, { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setCaseData(data.case);
        setMessages(data.messages || []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (caseId) loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseId]);

  async function handleUpdate(field: "status" | "priority", value: string) {
    if (!caseData) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/cases/${caseData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) {
        setCaseData((prev) => (prev ? { ...prev, [field]: value } : prev));
      }
    } finally {
      setUpdating(false);
    }
  }

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!caseData || !replyText.trim()) return;

    setSending(true);
    try {
      const res = await fetch(`/api/cases/${caseData.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderType: "agent",
          senderName: "Agente Soporte",
          content: replyText.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, data.message]);
        if (data.status && data.status !== caseData.status) {
          setCaseData((prev) =>
            prev ? { ...prev, status: data.status } : prev
          );
        }
        setReplyText("");
      }
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center gap-2 text-sm text-on-surface-variant">
        <Loader2 className="w-5 h-5 animate-spin" />
        Cargando detalle del caso...
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="bg-surface-container-lowest rounded-3xl p-10 text-center space-y-3 ambient-shadow-sm">
        <h2 className="font-headline font-bold text-lg text-on-surface">
          Caso no encontrado
        </h2>
        <Link
          href="/backoffice/casos"
          className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a la lista de casos
        </Link>
      </div>
    );
  }

  const statusMeta = STATUS_META[caseData.status] ?? STATUS_META.open;

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/backoffice/casos"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver a Lista de Casos
          </Link>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <span className="font-headline font-extrabold text-sm text-primary bg-primary-fixed px-3.5 py-1 rounded-full">
              {formatTicketCode(caseData.ticketNumber)}
            </span>
            <h1 className="font-headline font-extrabold text-xl sm:text-2xl text-on-surface">
              {caseData.subject}
            </h1>
          </div>
        </div>

        <span
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold",
            statusMeta.bg,
            statusMeta.text
          )}
        >
          <span className={cn("w-2 h-2 rounded-full", statusMeta.dot)} />
          {statusMeta.label}
        </span>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Conversation Column */}
        <section className="lg:col-span-8 bg-surface-container-lowest rounded-3xl ambient-shadow-sm overflow-hidden flex flex-col min-h-[65vh]">
          <div className="px-6 py-4 bg-surface-container-low/70 flex items-center justify-between">
            <span className="font-headline font-bold text-sm text-on-surface">
              Historial de Conversación (Vati + Agente)
            </span>
            <span className="text-xs text-on-surface-variant">
              {messages.length} mensajes
            </span>
          </div>

          <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[55vh]">
            {messages.map((msg) => {
              const isAgent = msg.senderType === "agent";
              const isBot = msg.senderType === "bot";

              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    isAgent ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <span className="text-[11px] font-semibold text-on-surface-variant mb-1 px-1 flex items-center gap-1">
                    {isBot && <Sparkles className="w-3 h-3 text-primary" />}
                    {msg.senderName ||
                      (isBot ? "Vati" : isAgent ? "Agente" : "Cliente")}{" "}
                    · {formatRelativeDate(msg.createdAt)}
                  </span>
                  <div
                    className={cn(
                      "rounded-3xl px-5 py-3.5 text-sm leading-relaxed whitespace-pre-line",
                      isAgent
                        ? "vati-gradient text-white rounded-tr-md"
                        : isBot
                        ? "bg-primary-fixed/50 text-on-surface rounded-tl-md"
                        : "bg-surface-container-low text-on-surface rounded-tl-md"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Agent Reply Box */}
          <form
            onSubmit={handleSendReply}
            className="p-4 sm:p-5 bg-surface-container-low/60 flex items-end gap-3"
          >
            <textarea
              rows={2}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Escribe una respuesta o nota de seguimiento para este caso..."
              className="flex-1 rounded-2xl bg-surface-container-lowest px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary/40 resize-none"
            />
            <button
              type="submit"
              disabled={sending || !replyText.trim()}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-semibold vati-gradient text-white hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 cursor-pointer shrink-0"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Responder
            </button>
          </form>
        </section>

        {/* Right Info Panel */}
        <aside className="lg:col-span-4 space-y-5">
          {/* Status & Priority Controls */}
          <div className="bg-surface-container-lowest rounded-3xl p-6 ambient-shadow-sm space-y-4">
            <h2 className="font-headline font-bold text-sm text-on-surface">
              Control del Ticket
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  Estado
                </label>
                <select
                  disabled={updating}
                  value={caseData.status}
                  onChange={(e) => handleUpdate("status", e.target.value)}
                  className="w-full rounded-2xl bg-surface-container-low px-4 py-2.5 text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 cursor-pointer"
                >
                  {Object.entries(STATUS_META).map(([key, meta]) => (
                    <option key={key} value={key}>
                      {meta.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  Prioridad
                </label>
                <select
                  disabled={updating}
                  value={caseData.priority}
                  onChange={(e) => handleUpdate("priority", e.target.value)}
                  className="w-full rounded-2xl bg-surface-container-low px-4 py-2.5 text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 cursor-pointer"
                >
                  {Object.entries(PRIORITY_META).map(([key, meta]) => (
                    <option key={key} value={key}>
                      {meta.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="bg-surface-container-lowest rounded-3xl p-6 ambient-shadow-sm space-y-3.5">
            <h2 className="font-headline font-bold text-sm text-on-surface">
              Datos del Cliente
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2.5 text-on-surface">
                <User className="w-4 h-4 text-primary shrink-0" />
                <span className="font-semibold">{caseData.customer.name}</span>
              </div>
              {caseData.customer.companyName && (
                <div className="flex items-center gap-2.5 text-on-surface-variant">
                  <Building2 className="w-4 h-4 text-primary shrink-0" />
                  <span>
                    {caseData.customer.companyName}
                    {caseData.customer.documentId
                      ? ` (${caseData.customer.documentId})`
                      : ""}
                  </span>
                </div>
              )}
              {caseData.customer.phone && (
                <div className="flex items-center gap-2.5 text-on-surface-variant">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span>{caseData.customer.phone}</span>
                </div>
              )}
              {caseData.customer.email && (
                <div className="flex items-center gap-2.5 text-on-surface-variant">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <span>{caseData.customer.email}</span>
                </div>
              )}
              {caseData.deviceModel && (
                <div className="flex items-center gap-2.5 text-on-surface-variant">
                  <Cpu className="w-4 h-4 text-primary shrink-0" />
                  <span>{caseData.deviceModel}</span>
                </div>
              )}
            </div>
          </div>

          {/* Gestion Metadata */}
          <div className="bg-surface-container-low rounded-3xl p-6 space-y-3">
            <h2 className="font-headline font-bold text-sm text-on-surface">
              Detalle de la Gestión
            </h2>
            <div className="space-y-2 text-xs">
              <div>
                <p className="text-on-surface-variant">Tipo</p>
                <p className="font-semibold text-on-surface">
                  {GESTION_LABELS[caseData.gestionType] ?? caseData.gestionType}
                </p>
              </div>
              {caseData.subCategory && (
                <div>
                  <p className="text-on-surface-variant">Subcategoría</p>
                  <p className="font-semibold text-on-surface">
                    {caseData.subCategory}
                  </p>
                </div>
              )}
              {caseData.metadata &&
                Object.entries(caseData.metadata).map(([k, v]) => (
                  <div key={k}>
                    <p className="text-on-surface-variant">{k}</p>
                    <p className="font-semibold text-on-surface whitespace-pre-line">
                      {v}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function CaseDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 flex items-center justify-center gap-2 text-sm text-on-surface-variant">
          <Loader2 className="w-5 h-5 animate-spin" />
          Cargando detalle del caso...
        </div>
      }
    >
      <CaseDetailContent />
    </Suspense>
  );
}
