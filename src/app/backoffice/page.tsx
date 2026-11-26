"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Inbox,
  Loader2,
  RefreshCw,
  Wrench,
} from "lucide-react";
import {
  cn,
  formatRelativeDate,
  formatTicketCode,
  GESTION_LABELS,
  PRIORITY_META,
  STATUS_META,
} from "@/lib/utils";

interface CaseItem {
  id: string;
  ticketNumber: number;
  gestionType: string;
  subCategory: string | null;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  customer: {
    name: string;
    companyName: string | null;
  };
}

interface DashboardStats {
  total: number;
  waitingAgent: number;
  inProgress: number;
  resolved: number;
  byGestion: Record<string, number>;
}

export default function BackofficeDashboardPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    waitingAgent: 0,
    inProgress: 0,
    resolved: 0,
    byGestion: {},
  });
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch("/api/cases", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setCases(data.cases || []);
        setStats(data.stats);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Panel de Control
          </p>
          <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-on-surface mt-1">
            Dashboard del Agente
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Monitorea en tiempo real las gestiones generadas desde Vati.
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold bg-surface-container-lowest ambient-shadow-sm text-on-surface hover:text-primary transition-colors cursor-pointer"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          Actualizar
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-surface-container-lowest rounded-3xl p-6 ambient-shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">
              Casos Totales
            </span>
            <div className="w-9 h-9 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <p className="font-headline font-extrabold text-3xl text-on-surface mt-4">
            {stats.total}
          </p>
          <p className="text-xs text-on-surface-variant mt-1">
            Registrados en Neon DB
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl p-6 ambient-shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">
              Esperando Agente
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="font-headline font-extrabold text-3xl text-on-surface mt-4">
            {stats.waitingAgent}
          </p>
          <p className="text-xs text-on-surface-variant mt-1">
            Pendientes de atención
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl p-6 ambient-shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">
              En Progreso
            </span>
            <div className="w-9 h-9 rounded-2xl bg-tertiary-fixed text-tertiary flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <p className="font-headline font-extrabold text-3xl text-on-surface mt-4">
            {stats.inProgress}
          </p>
          <p className="text-xs text-on-surface-variant mt-1">
            En gestión por soporte
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-3xl p-6 ambient-shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">
              Resueltos / Autogestión
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="font-headline font-extrabold text-3xl text-on-surface mt-4">
            {stats.resolved}
          </p>
          <p className="text-xs text-on-surface-variant mt-1">
            Casos completados
          </p>
        </div>
      </div>

      {/* Asymmetric Section: Recent Cases + Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-8 bg-surface-container-lowest rounded-3xl p-6 sm:p-8 ambient-shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline font-bold text-lg text-on-surface">
              Casos Recientes
            </h2>
            <Link
              href="/backoffice/casos"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:underline"
            >
              Ver todos
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 flex items-center justify-center text-on-surface-variant gap-2 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Cargando casos...
            </div>
          ) : cases.length === 0 ? (
            <div className="bg-surface-container-low rounded-3xl p-8 text-center space-y-3">
              <p className="text-sm font-semibold text-on-surface">
                Aún no hay casos registrados
              </p>
              <p className="text-xs text-on-surface-variant">
                Prueba creando una solicitud desde el chat de Vati y aparecerá aquí al instante.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold vati-gradient text-white mt-2"
              >
                Probar Chatbot Vati
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {cases.slice(0, 6).map((item) => {
                const status = STATUS_META[item.status] ?? STATUS_META.open;
                const priority =
                  PRIORITY_META[item.priority] ?? PRIORITY_META.medium;

                return (
                  <Link
                    key={item.id}
                    href={`/backoffice/casos/${item.id}`}
                    className="block bg-surface-container-low hover:bg-surface-container-high/70 rounded-2xl p-4 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-headline font-bold text-xs text-primary bg-primary-fixed/80 px-2.5 py-1 rounded-full">
                          {formatTicketCode(item.ticketNumber)}
                        </span>
                        <span className="text-sm font-semibold text-on-surface">
                          {item.subject}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold",
                          status.bg,
                          status.text
                        )}
                      >
                        <span
                          className={cn("w-1.5 h-1.5 rounded-full", status.dot)}
                        />
                        {status.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 mt-2.5 text-xs text-on-surface-variant">
                      <span>
                        {item.customer.companyName || item.customer.name} ·{" "}
                        {GESTION_LABELS[item.gestionType] ?? item.gestionType}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded-full text-[10px] font-semibold",
                            priority.bg,
                            priority.text
                          )}
                        >
                          {priority.label}
                        </span>
                        <span>{formatRelativeDate(item.createdAt)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <aside className="lg:col-span-4 bg-surface-container-lowest rounded-3xl p-6 sm:p-7 ambient-shadow-sm space-y-5">
          <h2 className="font-headline font-bold text-lg text-on-surface">
            Por Tipo de Gestión
          </h2>
          <div className="space-y-3">
            {Object.entries(GESTION_LABELS).map(([key, label]) => {
              const count = stats.byGestion[key] ?? 0;
              const pct =
                stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;

              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-on-surface">{label}</span>
                    <span className="font-bold text-primary">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-container-low overflow-hidden">
                    <div
                      className="h-full rounded-full vati-gradient transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
