"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Search, SlidersHorizontal } from "lucide-react";
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
  deviceModel: string | null;
  status: string;
  priority: string;
  createdAt: string;
  customer: {
    name: string;
    companyName: string | null;
    documentId: string | null;
  };
}

export default function CasesListPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gestionFilter, setGestionFilter] = useState("all");

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter !== "all") params.set("status", statusFilter);
        if (gestionFilter !== "all") params.set("gestionType", gestionFilter);
        if (search.trim()) params.set("search", search.trim());

        const res = await fetch(`/api/cases?${params.toString()}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (active && res.ok) {
          setCases(data.cases || []);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    const timer = setTimeout(load, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search, statusFilter, gestionFilter]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Gestión Operativa
        </p>
        <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-on-surface mt-1">
          Lista de Casos
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Filtra y atiende todas las solicitudes registradas por Vati.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface-container-lowest rounded-3xl p-4 sm:p-5 ambient-shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-outline absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por ticket (VTC-0001), comercio, cliente o RNC..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-surface-container-low text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary/40"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-3">
          <div className="flex items-center gap-2 bg-surface-container-low rounded-2xl px-3.5 py-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-on-surface-variant shrink-0" />
            <select
              value={gestionFilter}
              onChange={(e) => setGestionFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-on-surface focus:outline-none cursor-pointer"
            >
              <option value="all">Todas las gestiones</option>
              {Object.entries(GESTION_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-surface-container-low rounded-2xl px-3.5 py-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-on-surface focus:outline-none cursor-pointer"
            >
              <option value="all">Todos los estados</option>
              {Object.entries(STATUS_META).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cases List */}
      <div className="bg-surface-container-lowest rounded-3xl p-5 sm:p-7 ambient-shadow-sm">
        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-sm text-on-surface-variant">
            <Loader2 className="w-4 h-4 animate-spin" />
            Buscando casos...
          </div>
        ) : cases.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <p className="font-headline font-bold text-base text-on-surface">
              No se encontraron casos con estos filtros
            </p>
            <p className="text-xs text-on-surface-variant">
              Intenta limpiar la búsqueda o crea un caso desde el chat de Vati.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {cases.map((item) => {
              const status = STATUS_META[item.status] ?? STATUS_META.open;
              const priority =
                PRIORITY_META[item.priority] ?? PRIORITY_META.medium;

              return (
                <Link
                  key={item.id}
                  href={`/backoffice/casos/${item.id}`}
                  className="block bg-surface-container-low hover:bg-primary-fixed/35 rounded-2xl p-5 transition-all"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-headline font-extrabold text-xs text-primary bg-primary-fixed px-3 py-1 rounded-full">
                        {formatTicketCode(item.ticketNumber)}
                      </span>
                      <span className="font-headline font-bold text-sm sm:text-base text-on-surface">
                        {item.subject}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[11px] font-semibold",
                          priority.bg,
                          priority.text
                        )}
                      >
                        {priority.label}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold",
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
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-xs text-on-surface-variant">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="font-semibold text-on-surface">
                        {item.customer.companyName || item.customer.name}
                      </span>
                      <span>Contacto: {item.customer.name}</span>
                      {item.customer.documentId && (
                        <span>RNC/Documento: {item.customer.documentId}</span>
                      )}
                      {item.deviceModel && (
                        <span>Equipo: {item.deviceModel}</span>
                      )}
                    </div>
                    <span>{formatRelativeDate(item.createdAt)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
