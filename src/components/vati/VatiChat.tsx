"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  Loader2,
  MessageCircle,
  PackageMinus,
  ReceiptText,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Truck,
  Wrench,
  X,
} from "lucide-react";
import { FlowButton, GestionId, VATI_FLOWS } from "@/lib/vati-flows";
import {
  cn,
  formatRelativeDate,
  formatTicketCode,
  GESTION_LABELS,
  STATUS_META,
} from "@/lib/utils";
import VatiAvatar from "./VatiAvatar";

interface ChatItem {
  id: string;
  sender: "bot" | "customer" | "system";
  text: string;
  checklist?: string[];
  timestamp: string;
}

interface LookupResult {
  ticketNumber: number;
  gestionType: string;
  subCategory: string | null;
  subject: string;
  status: string;
  priority: string;
  companyName: string | null;
  customerName: string;
  updatedAt: string;
}

function getGestionIcon(id: string) {
  switch (id) {
    case "g_servicio_tecnico":
      return <Wrench className="w-3.5 h-3.5" />;
    case "g_otras_gestiones":
      return <Briefcase className="w-3.5 h-3.5" />;
    case "og_desinstalacion":
      return <PackageMinus className="w-3.5 h-3.5" />;
    case "og_reconexion":
      return <RefreshCw className="w-3.5 h-3.5" />;
    case "og_cambio_razon":
      return <Building2 className="w-3.5 h-3.5" />;
    case "og_traslado":
      return <Truck className="w-3.5 h-3.5" />;
    case "og_rollos":
      return <ReceiptText className="w-3.5 h-3.5" />;
    case "og_estado":
      return <Search className="w-3.5 h-3.5" />;
    case "og_agente":
      return <MessageCircle className="w-3.5 h-3.5" />;
    default:
      return null;
  }
}

export default function VatiChat() {
  // Widget open/close & welcome gate
  const [widgetOpen, setWidgetOpen] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  // Active conversation state
  const [currentStepId, setCurrentStepId] = useState<string>("welcome");
  const [selectedGestion, setSelectedGestion] = useState<GestionId | null>(null);
  const [selectedDeviceModel, setSelectedDeviceModel] = useState<string | null>(
    null
  );
  const [selectedProcessor, setSelectedProcessor] = useState<string | null>(
    null
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(
    null
  );
  const [selectedPriority, setSelectedPriority] = useState<
    "low" | "medium" | "high" | "urgent"
  >("medium");
  const [history, setHistory] = useState<ChatItem[]>([
    {
      id: "init-1",
      sender: "bot",
      text: VATI_FLOWS.welcome.message,
      timestamp: "",
    },
  ]);

  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdTicket, setCreatedTicket] = useState<{
    id: string;
    ticketNumber: number;
    status: string;
  } | null>(null);

  const [ticketQuery, setTicketQuery] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, currentStepId, createdTicket, lookupResult, hasStarted]);

  const currentStep = VATI_FLOWS[currentStepId];

  function handleStartConversation() {
    setHasStarted(true);
    setHistory([
      {
        id: `init-${Date.now()}`,
        sender: "bot",
        text: VATI_FLOWS.welcome.message,
        timestamp: "",
      },
    ]);
  }

  function handleReset() {
    setCurrentStepId("welcome");
    setSelectedGestion(null);
    setSelectedDeviceModel(null);
    setSelectedProcessor(null);
    setSelectedSubCategory(null);
    setSelectedPriority("medium");
    setFormValues({});
    setFormError(null);
    setCreatedTicket(null);
    setTicketQuery("");
    setLookupError(null);
    setLookupResult(null);
    setHistory([
      {
        id: `init-${Date.now()}`,
        sender: "bot",
        text: VATI_FLOWS.welcome.message,
        timestamp: "",
      },
    ]);
  }

  async function handleSelectButton(btn: FlowButton) {
    const nextStep = VATI_FLOWS[btn.nextStepId];
    if (!nextStep) return;

    if (btn.gestionType) setSelectedGestion(btn.gestionType);
    if (btn.deviceModel) {
      setSelectedDeviceModel(btn.deviceModel);
      setSelectedProcessor(btn.processor ?? null);
    } else if (btn.processor) {
      setSelectedProcessor(btn.processor);
    }
    if (btn.subCategory) setSelectedSubCategory(btn.subCategory);
    if (btn.priority) setSelectedPriority(btn.priority);

    const activeModel = btn.deviceModel ?? selectedDeviceModel;
    const activeProcessor = btn.deviceModel
      ? btn.processor ?? null
      : btn.processor ?? selectedProcessor;
    const now = new Date().toISOString();

    if (btn.kbQuery) {
      setHistory((prev) => [
        ...prev,
        {
          id: `u-${Date.now()}`,
          sender: "customer",
          text: btn.label,
          timestamp: now,
        },
      ]);
      setSendingMessage(true);
      try {
        const queries: string[] = [];
        if (activeModel && activeModel !== "General" && activeProcessor) {
          queries.push(`${activeModel} ${activeProcessor} ${btn.kbQuery}`);
        }
        if (activeModel && activeModel !== "General") {
          queries.push(`${activeModel} ${btn.kbQuery}`);
        }
        queries.push(btn.kbQuery);

        let matches: {
          title: string;
          deviceModel: string;
          processor: string;
          steps: string;
        }[] = [];

        for (const q of queries) {
          const res = await fetch(
            `/api/knowledge?search=${encodeURIComponent(q)}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.articles?.length > 0) {
              matches = data.articles;
              break;
            }
          }
        }

        if (matches.length > 0) {
          const top = matches.slice(0, 2);
          const formatted = top
            .map(
              (a) =>
                `• ${a.title} (${a.deviceModel} · ${a.processor})\n${a.steps}`
            )
            .join("\n\n");

          const labelModel = activeProcessor
            ? `${activeModel || "tu equipo"} (${activeProcessor})`
            : activeModel || "tu equipo";

          setHistory((prev) => [
            ...prev,
            {
              id: `b-kb-${Date.now() + 1}`,
              sender: "bot",
              text: `Procedimiento para ${labelModel}:\n\n${formatted}\n\n${VATI_FLOWS.st_kb_resolution.message}`,
              timestamp: new Date().toISOString(),
            },
          ]);
          setCurrentStepId("st_kb_resolution");
          setSendingMessage(false);
          return;
        }
      } catch {
        // Fallback to guided step
      } finally {
        setSendingMessage(false);
      }
    }

    const botMessage =
      btn.nextStepId === "st_processor_menu" && activeModel
        ? `Modelo ${activeModel} seleccionado. ¿Con qué procesadora trabaja tu equipo?`
        : btn.nextStepId === "st_faults_menu" && activeModel
          ? `Equipo ${activeModel}${activeProcessor ? ` (${activeProcessor})` : ""
          } seleccionado. ¿Qué falla presenta?`
          : nextStep.message;

    const fullModelLabel =
      activeModel && activeModel !== "General"
        ? activeProcessor
          ? `${activeModel} (${activeProcessor})`
          : activeModel
        : "";

    setHistory((prev) => [
      ...prev,
      {
        id: `u-${Date.now()}`,
        sender: "customer",
        text: btn.label,
        timestamp: now,
      },
      {
        id: `b-${Date.now() + 1}`,
        sender: "bot",
        text: botMessage,
        checklist: nextStep.checklist,
        timestamp: now,
      },
    ]);

    setCurrentStepId(btn.nextStepId);
    setFormValues({
      ...(activeModel && activeModel !== "General"
        ? { deviceModel: activeModel }
        : {}),
    });
    setFormError(null);
    setLookupResult(null);
    setLookupError(null);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentStep.form) return;

    for (const field of currentStep.form.fields) {
      if (field.required && !formValues[field.name]?.trim()) {
        setFormError(`Por favor completa "${field.label}".`);
        return;
      }
    }

    setFormError(null);
    setSubmitting(true);

    try {
      const gestionType = selectedGestion ?? "insumos_consultas";
      const gestionLabel = GESTION_LABELS[gestionType] ?? gestionType;
      const subject = selectedSubCategory
        ? `${gestionLabel} — ${selectedSubCategory}`
        : gestionLabel;

      const metadata: Record<string, string> = {};
      for (const field of currentStep.form.fields) {
        if (
          ![
            "customerName",
            "companyName",
            "documentId",
            "phone",
            "email",
            "deviceModel",
          ].includes(field.name) &&
          formValues[field.name]
        ) {
          metadata[field.label] = formValues[field.name];
        }
      }

      const summaryLines = currentStep.form.fields
        .filter((f) => formValues[f.name]?.trim())
        .map((f) => `${f.label}: ${formValues[f.name].trim()}`);

      const customerSummary = summaryLines.join("\n");

      const transcript = [
        ...history.map((item) => ({
          senderType: item.sender,
          senderName: item.sender === "bot" ? "Vati" : formValues.customerName,
          content: item.checklist
            ? `${item.text}\n• ${item.checklist.join("\n• ")}`
            : item.text,
        })),
        {
          senderType: "customer" as const,
          senderName: formValues.customerName,
          content: customerSummary,
        },
      ];

      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formValues.customerName || "Cliente",
          companyName: formValues.companyName || "",
          documentId: formValues.documentId || "",
          phone: formValues.phone || "",
          email: formValues.email || "",
          gestionType,
          subCategory: selectedSubCategory || undefined,
          subject,
          deviceModel: formValues.deviceModel || selectedDeviceModel || "",
          priority: selectedPriority,
          status: currentStep.form.defaultStatus,
          metadata,
          transcript,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo registrar tu solicitud.");
      }

      const ticketCode = formatTicketCode(data.case.ticketNumber);
      const isResolved = currentStep.form.defaultStatus === "resolved";

      setCreatedTicket({
        id: data.case.id,
        ticketNumber: data.case.ticketNumber,
        status: data.case.status,
      });

      setHistory((prev) => [
        ...prev,
        {
          id: `u-form-${Date.now()}`,
          sender: "customer",
          text: customerSummary,
          timestamp: new Date().toISOString(),
        },
        {
          id: `b-done-${Date.now() + 1}`,
          sender: "bot",
          text: isResolved
            ? `¡Excelente! Autogestión registrada con referencia ${ticketCode}.`
            : `¡Listo! Tu solicitud fue registrada con el ticket ${ticketCode}. Nuestro equipo la atenderá muy pronto.`,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Ocurrió un error inesperado."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTicketLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!ticketQuery.trim()) return;

    setLookupLoading(true);
    setLookupError(null);
    setLookupResult(null);

    try {
      const res = await fetch(
        `/api/tickets/${encodeURIComponent(ticketQuery.trim())}`
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No encontramos ese ticket.");
      }
      setLookupResult(data.ticket);
    } catch (err) {
      setLookupError(
        err instanceof Error ? err.message : "Error al consultar el ticket."
      );
    } finally {
      setLookupLoading(false);
    }
  }

  async function handleChatSend(e: React.FormEvent) {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text || sendingMessage) return;

    setChatInput("");
    const now = new Date().toISOString();

    if (createdTicket) {
      setHistory((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, sender: "customer", text, timestamp: now },
      ]);
      setSendingMessage(true);
      try {
        await fetch(`/api/cases/${createdTicket.id}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderType: "customer",
            senderName: formValues.customerName || "Cliente",
            content: text,
          }),
        });
        setHistory((prev) => [
          ...prev,
          {
            id: `b-${Date.now() + 1}`,
            sender: "bot",
            text: `Mensaje añadido al ticket ${formatTicketCode(
              createdTicket.ticketNumber
            )}.`,
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setSendingMessage(false);
      }
      return;
    }

    const normalized = text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const ticketMatch = text.match(/(?:vtc-?)?(\d{1,6})/i);
    if (
      (currentStepId === "ticket_lookup" && ticketMatch) ||
      /vtc-?\d+/i.test(text)
    ) {
      setHistory((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, sender: "customer", text, timestamp: now },
      ]);
      setSendingMessage(true);
      try {
        const res = await fetch(
          `/api/tickets/${encodeURIComponent(ticketMatch![0])}`
        );
        const data = await res.json();
        if (!res.ok) {
          setHistory((prev) => [
            ...prev,
            {
              id: `b-${Date.now() + 1}`,
              sender: "bot",
              text: data.error || "No encontré un ticket con ese número.",
              timestamp: new Date().toISOString(),
            },
          ]);
        } else {
          const t = data.ticket as LookupResult;
          const stLabel = STATUS_META[t.status]?.label ?? t.status;
          setLookupResult(t);
          setHistory((prev) => [
            ...prev,
            {
              id: `b-${Date.now() + 1}`,
              sender: "bot",
              text: `Ticket ${formatTicketCode(t.ticketNumber)} (${t.subject
                }) — Estado: ${stLabel}.`,
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      } finally {
        setSendingMessage(false);
      }
      return;
    }

    const isNavIntent =
      /^(menu|inicio|volver|empezar|hola|otra|otras gestiones|servicio tecnico|st)$/i.test(
        normalized
      );

    if (!isNavIntent && normalized.length >= 3) {
      setSendingMessage(true);
      try {
        const kbRes = await fetch(
          `/api/knowledge?search=${encodeURIComponent(text)}`
        );
        if (kbRes.ok) {
          const kbData = await kbRes.json();
          const topMatch = kbData.articles?.[0];
          if (topMatch) {
            setSelectedGestion("servicio_tecnico");
            setSelectedSubCategory(`${topMatch.deviceModel} · ${topMatch.title}`);
            setHistory((prev) => [
              ...prev,
              {
                id: `u-${Date.now()}`,
                sender: "customer",
                text,
                timestamp: now,
              },
              {
                id: `b-kb-${Date.now() + 1}`,
                sender: "bot",
                text: `Encontré esto en la base de conocimiento (${topMatch.deviceModel} · ${topMatch.processor}):\n\n${topMatch.title}\n\n${topMatch.steps}\n\n¿Se resolvió tu falla o deseas crear un ticket?`,
                timestamp: new Date().toISOString(),
              },
            ]);
            setCurrentStepId("st_kb_resolution");
            setSendingMessage(false);
            return;
          }
        }
      } catch {
        // Fallback below
      } finally {
        setSendingMessage(false);
      }
    }

    let nextStepId: string | null = null;
    let nextGestion: GestionId | null = null;
    let nextSub: string | null = null;

    if (/(menu|inicio|volver|empezar|hola)/.test(normalized)) {
      nextStepId = "welcome";
    } else if (/(desinstal|retiro|baja)/.test(normalized)) {
      nextStepId = "desinst_menu";
      nextGestion = "desinstalacion";
    } else if (/(reconex|reactivar|suspend)/.test(normalized)) {
      nextStepId = "reconexion_menu";
      nextGestion = "reconexion";
    } else if (/(razon social|rnc|ruc|rif|titular|empresa)/.test(normalized)) {
      nextStepId = "razon_menu";
      nextGestion = "cambio_razon_social";
    } else if (/(traslado|direccion|mudanza|sucursal)/.test(normalized)) {
      nextStepId = "traslado_form";
      nextGestion = "traslado";
      nextSub = "Cambio de dirección / sucursal";
    } else if (/(rollo|insumo|papel|cargador)/.test(normalized)) {
      nextStepId = "insumos_form";
      nextGestion = "insumos_consultas";
      nextSub = "Solicitud de insumos";
    } else if (/(ticket|estado|seguimiento)/.test(normalized)) {
      nextStepId = "ticket_lookup";
      nextGestion = "insumos_consultas";
      nextSub = "Consulta de estado";
    } else if (/(agente|humano|persona|asesor)/.test(normalized)) {
      nextStepId = "agente_form";
      nextGestion = "insumos_consultas";
      nextSub = "Contacto con agente";
    } else if (
      /(tecnico|st|falla|error|pos|equipo|terminal|pantalla)/.test(normalized)
    ) {
      nextStepId = "st_model_menu";
      nextGestion = "servicio_tecnico";
    } else if (/(otra|administrativ|gestion)/.test(normalized)) {
      nextStepId = "otras_gestiones_menu";
    }

    if (nextStepId && VATI_FLOWS[nextStepId]) {
      if (nextGestion) setSelectedGestion(nextGestion);
      if (nextSub) setSelectedSubCategory(nextSub);
      const targetStep = VATI_FLOWS[nextStepId];
      setCurrentStepId(nextStepId);
      setHistory((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, sender: "customer", text, timestamp: now },
        {
          id: `b-${Date.now() + 1}`,
          sender: "bot",
          text: targetStep.message,
          checklist: targetStep.checklist,
          timestamp: now,
        },
      ]);
    } else {
      setHistory((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, sender: "customer", text, timestamp: now },
        {
          id: `b-${Date.now() + 1}`,
          sender: "bot",
          text: "Selecciona una opción de los botones o escríbeme el modelo y la falla (por ejemplo, 'ME60 error TCP').",
          timestamp: now,
        },
      ]);
    }
  }

  return (
    <div className="min-h-screen bg-white text-on-surface flex flex-col">
      {/* Clean Portal Header */}
      <header className="px-6 sm:px-10 py-4 bg-white/90 backdrop-blur-md sticky top-0 z-20 shadow-[0_1px_0_rgba(58,56,139,0.08)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl vati-gradient flex items-center justify-center text-white shadow-md shadow-primary/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-headline font-extrabold text-base text-primary block leading-none">
                VATC Soporte
              </span>
              <span className="text-[11px] text-on-surface-variant">
                Centro de Autogestión POS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setWidgetOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-primary-fixed/80 text-primary hover:bg-primary-fixed transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Abrir Vati
            </button>
            <Link
              href="/backoffice"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold vati-gradient text-white hover:shadow-md hover:shadow-primary/25 transition-all"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Backoffice
            </Link>
          </div>
        </div>
      </header>

      {/* Portal Background Showcase (like Mercantil's MIA landing page) */}
      <main className="flex-1 bg-gradient-to-b from-[#f6f8fc] to-white px-6 sm:px-10 py-10 sm:py-14">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left / Center Floating MIA-Style Vati Widget */}
          <div className="lg:col-span-5 flex justify-center">
            {widgetOpen ? (
              <div className="w-full max-w-[390px] h-[640px] rounded-[28px] bg-white shadow-[0_28px_80px_-16px_rgba(30,41,110,0.32)] ring-2 ring-[#1c4ea8]/25 overflow-hidden flex flex-col relative">
                {!hasStarted ? (
                  /* PRE-CHAT IDENTIFICATION SCREEN (MIA-style) */
                  <div className="flex-1 flex flex-col bg-gradient-to-b from-[#d8e6fb] via-[#e9f1fc] to-[#e9f1fc]">
                    {/* Top bar inside widget */}
                    <div className="px-5 pt-4 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-primary font-headline font-extrabold text-sm">
                        <Sparkles className="w-4 h-4 text-secondary" />
                        <span>VATC</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setWidgetOpen(false)}
                        aria-label="Cerrar asistente"
                        className="w-8 h-8 rounded-full hover:bg-white/60 flex items-center justify-center text-secondary transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Avatar overlapping white card */}
                    <div className="relative flex-1 flex flex-col mt-3">
                      <div className="mx-auto z-10 -mb-12 p-1.5 rounded-full bg-white shadow-lg shadow-secondary/20 ring-2 ring-[#3b82f6]/40">
                        <VatiAvatar size="lg" />
                      </div>

                      <div className="flex-1 bg-white rounded-t-[28px] pt-16 px-6 pb-5 flex flex-col justify-between shadow-[0_-8px_30px_rgba(0,88,190,0.06)]">
                        <div className="space-y-6 text-center my-auto">
                          <div>
                            <h1 className="font-headline font-extrabold text-2xl text-primary">
                              👋 ¡Hola, soy Vati!
                            </h1>
                            <p className="text-xs text-on-surface-variant mt-2.5 leading-relaxed max-w-[260px] mx-auto">
                              Tu asistente virtual de autogestión y soporte
                              técnico disponible las 24 horas.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={handleStartConversation}
                            className="w-full h-11 rounded-full text-xs font-bold vati-gradient text-white shadow-md shadow-primary/25 hover:brightness-105 transition-all cursor-pointer"
                          >
                            Iniciar conversación
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ACTIVE COMPACT CHAT SCREEN */
                  <div className="flex-1 flex flex-col h-full">
                    {/* Compact Chat Header */}
                    <div className="vati-gradient px-4 py-3 flex items-center justify-between text-white shrink-0">
                      <div className="flex items-center gap-2.5">
                        <div className="p-0.5 rounded-full bg-white/90">
                          <VatiAvatar size="sm" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-headline font-bold text-sm leading-none">
                              Vati
                            </p>
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          </div>
                          <p className="text-[10px] text-white/80 mt-0.5">
                            Asistente Virtual · 24/7
                            {selectedDeviceModel
                              ? ` · ${selectedDeviceModel}${selectedProcessor
                                ? ` (${selectedProcessor})`
                                : ""
                              }`
                              : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handleReset}
                          title="Reiniciar chat"
                          className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setWidgetOpen(false)}
                          title="Minimizar"
                          className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Chat Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#edf2fa]">
                      {history.map((item) => (
                        <div
                          key={item.id}
                          className={cn(
                            "flex gap-2",
                            item.sender === "customer"
                              ? "justify-end"
                              : "justify-start"
                          )}
                        >
                          {item.sender === "bot" && (
                            <div className="mt-0.5">
                              <VatiAvatar size="sm" />
                            </div>
                          )}

                          <div
                            className={cn(
                              "max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs",
                              item.sender === "bot"
                                ? "bg-white text-on-surface rounded-tl-sm"
                                : "vati-gradient text-white rounded-tr-sm whitespace-pre-line"
                            )}
                          >
                            <p className="whitespace-pre-line">{item.text}</p>

                            {item.checklist && item.checklist.length > 0 && (
                              <ol className="mt-2.5 space-y-1.5 bg-[#f4f7fc] rounded-xl p-2.5">
                                {item.checklist.map((stepText, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-2 text-[11px] text-on-surface"
                                  >
                                    <span className="w-4 h-4 rounded-full bg-primary-fixed text-primary font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                      {idx + 1}
                                    </span>
                                    <span>{stepText}</span>
                                  </li>
                                ))}
                              </ol>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Compact Quick-Reply Pill Buttons */}
                      {!createdTicket && currentStep.buttons && (
                        <div className="pl-10 space-y-2">
                          <div className="flex flex-wrap gap-1.5">
                            {currentStep.buttons.map((btn) => (
                              <button
                                key={btn.id}
                                type="button"
                                disabled={sendingMessage}
                                onClick={() => handleSelectButton(btn)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-white text-primary ring-1 ring-secondary/30 hover:bg-secondary hover:text-white hover:ring-secondary shadow-2xs transition-all cursor-pointer disabled:opacity-60"
                              >
                                {getGestionIcon(btn.id)}
                                <span>{btn.label}</span>
                              </button>
                            ))}
                          </div>

                          {currentStepId !== "welcome" && (
                            <button
                              type="button"
                              onClick={handleReset}
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-secondary hover:underline cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Menú principal
                            </button>
                          )}
                        </div>
                      )}

                      {/* Compact Inline Form */}
                      {!createdTicket && currentStep.form && (
                        <form
                          onSubmit={handleFormSubmit}
                          className="bg-white rounded-2xl p-3.5 space-y-2.5 shadow-xs"
                        >
                          <p className="font-headline font-bold text-xs text-primary">
                            {currentStep.form.title}
                          </p>

                          <div className="space-y-2">
                            {currentStep.form.fields.map((field) => (
                              <div key={field.name}>
                                <label className="block text-[10px] font-semibold text-on-surface-variant mb-0.5">
                                  {field.label}
                                  {field.required && (
                                    <span className="text-secondary ml-0.5">
                                      *
                                    </span>
                                  )}
                                </label>
                                {field.type === "textarea" ? (
                                  <textarea
                                    rows={2}
                                    required={field.required}
                                    placeholder={field.placeholder}
                                    value={formValues[field.name] ?? ""}
                                    onChange={(e) =>
                                      setFormValues((prev) => ({
                                        ...prev,
                                        [field.name]: e.target.value,
                                      }))
                                    }
                                    className="w-full rounded-xl bg-[#f4f7fc] px-3 py-2 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary/40 resize-none"
                                  />
                                ) : (
                                  <input
                                    type={field.type || "text"}
                                    required={field.required}
                                    placeholder={field.placeholder}
                                    value={formValues[field.name] ?? ""}
                                    onChange={(e) =>
                                      setFormValues((prev) => ({
                                        ...prev,
                                        [field.name]: e.target.value,
                                      }))
                                    }
                                    className="w-full rounded-xl bg-[#f4f7fc] px-3 py-2 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary/40"
                                  />
                                )}
                              </div>
                            ))}
                          </div>

                          {formError && (
                            <p className="text-[11px] font-medium text-error bg-error-container/70 rounded-xl px-3 py-1.5">
                              {formError}
                            </p>
                          )}

                          <div className="flex items-center justify-between gap-2 pt-1">
                            <button
                              type="button"
                              onClick={handleReset}
                              className="text-[11px] font-semibold text-on-surface-variant hover:text-primary cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              disabled={submitting}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-bold vati-gradient text-white cursor-pointer disabled:opacity-60"
                            >
                              {submitting ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Send className="w-3 h-3" />
                              )}
                              {currentStep.form.submitLabel}
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Compact Ticket Lookup */}
                      {!createdTicket && currentStep.ticketLookup && (
                        <div className="space-y-2">
                          <form
                            onSubmit={handleTicketLookup}
                            className="bg-white rounded-2xl p-3 flex gap-2 shadow-xs"
                          >
                            <input
                              type="text"
                              placeholder="Por ejemplo, VTC-0001"
                              value={ticketQuery}
                              onChange={(e) => setTicketQuery(e.target.value)}
                              className="flex-1 rounded-xl bg-[#f4f7fc] px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40"
                            />
                            <button
                              type="submit"
                              disabled={lookupLoading}
                              className="px-3.5 py-2 rounded-xl text-xs font-bold vati-gradient text-white cursor-pointer"
                            >
                              {lookupLoading ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Search className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </form>

                          {lookupError && (
                            <p className="text-[11px] text-error bg-error-container/70 rounded-xl px-3 py-2">
                              {lookupError}
                            </p>
                          )}

                          {lookupResult && (
                            <div className="bg-white rounded-2xl p-3.5 space-y-1.5 shadow-xs text-xs">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-headline font-bold text-primary">
                                  {formatTicketCode(lookupResult.ticketNumber)}
                                </span>
                                <span
                                  className={cn(
                                    "px-2 py-0.5 rounded-full text-[10px] font-semibold",
                                    STATUS_META[lookupResult.status]?.bg,
                                    STATUS_META[lookupResult.status]?.text
                                  )}
                                >
                                  {STATUS_META[lookupResult.status]?.label ??
                                    lookupResult.status}
                                </span>
                              </div>
                              <p className="font-semibold text-on-surface">
                                {lookupResult.subject}
                              </p>
                              <p className="text-[10px] text-on-surface-variant">
                                Actualizado:{" "}
                                {formatRelativeDate(lookupResult.updatedAt)}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Ticket Created Card */}
                      {createdTicket && (
                        <div className="bg-emerald-50 rounded-2xl p-3.5 space-y-2 ring-1 ring-emerald-200">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="font-headline font-bold text-xs text-emerald-900">
                              Ticket {formatTicketCode(createdTicket.ticketNumber)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/backoffice/casos/${createdTicket.id}`}
                              className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-white text-primary shadow-2xs"
                            >
                              Ver en Backoffice
                            </Link>
                            <button
                              type="button"
                              onClick={handleReset}
                              className="px-3 py-1.5 rounded-full text-[11px] font-semibold vati-gradient text-white cursor-pointer"
                            >
                              Nueva gestión
                            </button>
                          </div>
                        </div>
                      )}

                      <div ref={bottomRef} />
                    </div>

                    {/* Compact Bottom Chat Input Bar */}
                    <form
                      onSubmit={handleChatSend}
                      className="p-3 bg-white border-t border-surface-container flex items-center gap-2 shrink-0"
                    >
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={
                          createdTicket
                            ? "Escribe un mensaje para el agente..."
                            : "Escribe tu consulta aquí..."
                        }
                        className="flex-1 rounded-full bg-[#f4f7fc] px-4 py-2.5 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary/40"
                      />
                      <button
                        type="submit"
                        disabled={sendingMessage || !chatInput.trim()}
                        aria-label="Enviar mensaje"
                        className="w-9 h-9 rounded-full vati-gradient text-white flex items-center justify-center hover:brightness-105 transition-all disabled:opacity-45 cursor-pointer shrink-0"
                      >
                        {sendingMessage ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              /* Minimized Launcher Card */
              <div className="w-full max-w-[390px] rounded-3xl bg-[#eef3fb] p-8 text-center space-y-4">
                <div className="mx-auto w-fit p-1 rounded-full bg-white shadow-md">
                  <VatiAvatar size="lg" />
                </div>
                <div>
                  <h2 className="font-headline font-extrabold text-lg text-primary">
                    ¿Necesitas ayuda con tu POS?
                  </h2>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Vati está disponible las 24 horas para guiarte paso a paso.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setWidgetOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold vati-gradient text-white shadow-md shadow-primary/25 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  Abrir chat con Vati
                </button>
              </div>
            )}
          </div>

          {/* Right Side — Clean Portal Info Cards (like Mercantil page) */}
          <div className="lg:col-span-7 space-y-8 pt-2">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-fixed/80 text-primary">
                <Clock className="w-3.5 h-3.5" />
                Atención rápida y sencilla, 24/7
              </span>
              <h2 className="font-headline font-extrabold text-3xl sm:text-4xl text-on-surface leading-tight">
                Autogestión de Servicio Técnico y Gestiones con{" "}
                <span className="text-primary">Vati</span>
              </h2>
              <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed max-w-xl">
                Resuelve fallas técnicas de tus equipos POS (N910, N950, N750,
                ME60, SP600, M51) o realiza solicitudes administrativas al
                instante, sin llamadas ni esperas.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-3xl bg-[#eef4fc] p-6 space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-white text-secondary flex items-center justify-center shadow-xs">
                  <Wrench className="w-5 h-5" />
                </div>
                <h3 className="font-headline font-bold text-sm text-on-surface">
                  Servicio Técnico POS
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Diagnóstico guiado por modelo, APN, Wi-Fi, TMS, limpieza y
                  códigos de error.
                </p>
              </div>

              <div className="rounded-3xl bg-[#eef4fc] p-6 space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-white text-secondary flex items-center justify-center shadow-xs">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <h3 className="font-headline font-bold text-sm text-on-surface">
                  Reconexión y Desinstalación
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Solicita reactivaciones por pago, retiros de equipos y
                  traslados de sucursal.
                </p>
              </div>

              <div className="rounded-3xl bg-[#eef4fc] p-6 space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-white text-secondary flex items-center justify-center shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="font-headline font-bold text-sm text-on-surface">
                  Gestión Comercial
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Cambio de razón social, solicitud de rollos/insumos y consulta
                  de tickets.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/backoffice"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-white text-primary ring-1 ring-primary/20 hover:bg-primary-fixed/40 transition-colors"
              >
                Ir al Backoffice de Agentes
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/backoffice/conocimiento"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-white text-secondary ring-1 ring-secondary/20 hover:bg-secondary-fixed/40 transition-colors"
              >
                Editar Base de Conocimiento
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Launcher Button when widget is closed */}
      {!widgetOpen && (
        <button
          type="button"
          onClick={() => setWidgetOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 pl-2 pr-5 py-2 rounded-full vati-gradient text-white shadow-xl shadow-primary/30 hover:scale-105 transition-transform cursor-pointer"
        >
          <div className="p-0.5 rounded-full bg-white">
            <VatiAvatar size="sm" />
          </div>
          <span className="font-headline font-bold text-xs">
            Chatear con Vati
          </span>
        </button>
      )}
    </div>
  );
}
