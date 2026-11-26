"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Cpu,
  Edit3,
  Layers,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { cn, formatRelativeDate } from "@/lib/utils";

interface KnowledgeArticle {
  id: number;
  category: string;
  deviceModel: string;
  processor: string;
  title: string;
  symptoms: string;
  steps: string;
  updatedAt: string;
}

const MODELS = [
  { id: "N910", label: "N910", hasProcessorSubcategories: true },
  { id: "N950", label: "N950", hasProcessorSubcategories: true },
  { id: "N750", label: "N750", hasProcessorSubcategories: true },
  { id: "ME60", label: "ME60", hasProcessorSubcategories: false },
  { id: "SP600", label: "SP600", hasProcessorSubcategories: false },
  { id: "M51", label: "M51", hasProcessorSubcategories: true },
  { id: "General", label: "General y Tablas", hasProcessorSubcategories: true },
];

const PROCESSOR_SUBCATEGORIES = [
  { id: "ALL", label: "Todas" },
  { id: "Credicard", label: "Credicard" },
  { id: "Platco", label: "Platco" },
];

function getNormalizedModel(raw: string): string {
  if (raw.includes("/")) return "General";
  if (MODELS.some((m) => m.id === raw)) return raw;
  return "General";
}

function getNormalizedProcessor(article: KnowledgeArticle): string {
  const combined =
    `${article.processor} ${article.title} ${article.steps}`.toLowerCase();
  const hasCredicard =
    combined.includes("credicard") || combined.includes("ccr");
  const hasPlatco = combined.includes("platco");

  if (article.processor.toLowerCase().includes("credicard")) return "Credicard";
  if (article.processor.toLowerCase().includes("platco")) return "Platco";
  if (hasCredicard && !hasPlatco) return "Credicard";
  if (hasPlatco && !hasCredicard) return "Platco";
  return "General";
}

export default function KnowledgeBaseByModelPage() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("N910");
  const [selectedProcessor, setSelectedProcessor] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Add new procedure state
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newProcessor, setNewProcessor] = useState("Credicard");
  const [newSteps, setNewSteps] = useState("");
  const [creating, setCreating] = useState(false);

  // Inline edit state (default is reading view until user clicks Editar)
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editProcessor, setEditProcessor] = useState("Credicard");
  const [editSteps, setEditSteps] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadAllArticles() {
    setLoading(true);
    try {
      const res = await fetch("/api/knowledge", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setArticles(data.articles || []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAllArticles();
  }, []);

  const currentModelConfig = useMemo(
    () => MODELS.find((m) => m.id === selectedModel) ?? MODELS[0],
    [selectedModel]
  );

  const countsByModel = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of MODELS) counts[m.id] = 0;
    for (const a of articles) {
      const key = getNormalizedModel(a.deviceModel);
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }, [articles]);

  const countsByProcessorForModel = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: 0,
      Credicard: 0,
      Platco: 0,
    };
    for (const a of articles) {
      if (getNormalizedModel(a.deviceModel) !== selectedModel) continue;
      counts.ALL += 1;
      const proc = getNormalizedProcessor(a);
      if (proc === "Credicard") counts.Credicard += 1;
      if (proc === "Platco") counts.Platco += 1;
    }
    return counts;
  }, [articles, selectedModel]);

  const modelArticles = useMemo(() => {
    const q = search.trim().toLowerCase();
    return articles.filter((a) => {
      if (getNormalizedModel(a.deviceModel) !== selectedModel) return false;
      if (
        currentModelConfig.hasProcessorSubcategories &&
        selectedProcessor !== "ALL"
      ) {
        const proc = getNormalizedProcessor(a);
        if (proc !== selectedProcessor) return false;
      }
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) || a.steps.toLowerCase().includes(q)
      );
    });
  }, [
    articles,
    selectedModel,
    selectedProcessor,
    currentModelConfig.hasProcessorSubcategories,
    search,
  ]);

  function showTempNotice(msg: string) {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  }

  function handleOpenAdd() {
    setIsAdding(true);
    setEditingId(null);
    setError(null);
    if (selectedProcessor === "Credicard" || selectedProcessor === "Platco") {
      setNewProcessor(selectedProcessor);
    } else if (selectedModel === "ME60") {
      setNewProcessor("Platco");
    } else if (selectedModel === "SP600") {
      setNewProcessor("Credicard");
    } else {
      setNewProcessor("Credicard");
    }
  }

  async function handleCreateProcedure(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newSteps.trim()) {
      setError("Completa el título y los pasos del procedimiento.");
      return;
    }

    const processorToSave = currentModelConfig.hasProcessorSubcategories
      ? newProcessor
      : selectedModel === "ME60"
      ? "Platco"
      : "Credicard";

    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          deviceModel: selectedModel,
          processor: processorToSave,
          steps: newSteps.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo añadir el procedimiento.");
      }

      setArticles((prev) => [...prev, data.article]);
      setNewTitle("");
      setNewSteps("");
      setIsAdding(false);
      showTempNotice(
        `Procedimiento añadido a ${selectedModel} (${processorToSave})`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al añadir procedimiento."
      );
    } finally {
      setCreating(false);
    }
  }

  function startEdit(article: KnowledgeArticle) {
    setEditingId(article.id);
    setEditTitle(article.title);
    setEditProcessor(getNormalizedProcessor(article));
    setEditSteps(article.steps);
    setError(null);
  }

  async function handleSaveEdit(id: number) {
    if (!editTitle.trim() || !editSteps.trim()) {
      setError("El título y los pasos no pueden estar vacíos.");
      return;
    }

    setSavingEdit(true);
    setError(null);
    try {
      const res = await fetch(`/api/knowledge/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          processor: editProcessor,
          steps: editSteps.trim(),
          symptoms: `${editTitle.trim().toLowerCase()} ${selectedModel.toLowerCase()} ${editProcessor.toLowerCase()}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo actualizar.");
      }

      setArticles((prev) =>
        prev.map((a) => (a.id === id ? data.article : a))
      );
      setEditingId(null);
      showTempNotice("Procedimiento actualizado en Neon");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/knowledge/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("No se pudo eliminar el procedimiento.");
      }
      setArticles((prev) => prev.filter((a) => a.id !== id));
      if (editingId === id) setEditingId(null);
      showTempNotice("Procedimiento eliminado de Neon");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Manual Técnico POS · Neon DB
          </p>
          <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-on-surface mt-1">
            Base de Conocimiento
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Selecciona el modelo y su procesadora para ver, añadir, editar o eliminar procedimientos.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold vati-gradient text-white hover:shadow-lg hover:shadow-primary/25 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Añadir procedimiento en {selectedModel}
          {currentModelConfig.hasProcessorSubcategories &&
          selectedProcessor !== "ALL"
            ? ` (${selectedProcessor})`
            : ""}
        </button>
      </div>

      {/* Model Selector + Processor Subcategories */}
      <div className="bg-surface-container-lowest rounded-3xl p-5 ambient-shadow-sm space-y-4">
        {/* Level 1: Models */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2.5 px-1">
            1. Modelo de equipo
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            {MODELS.map((m) => {
              const active = selectedModel === m.id;
              const count = countsByModel[m.id] ?? 0;

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setSelectedModel(m.id);
                    setSelectedProcessor("ALL");
                    setIsAdding(false);
                    setEditingId(null);
                    setError(null);
                  }}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer",
                    active
                      ? "vati-gradient text-white shadow-md shadow-primary/20"
                      : "bg-surface-container-low text-on-surface hover:bg-primary-fixed/50 hover:text-primary"
                  )}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-extrabold",
                      active
                        ? "bg-white/20 text-white"
                        : "bg-surface-container-lowest text-primary"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Level 2: Processor Subcategories inside the selected Model */}
        {currentModelConfig.hasProcessorSubcategories && (
          <div className="pt-3 border-t border-surface-container flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant mr-2">
              <Layers className="w-3.5 h-3.5 text-primary" />
              Procesadora en {currentModelConfig.label}:
            </span>

            {PROCESSOR_SUBCATEGORIES.map((sub) => {
              const active = selectedProcessor === sub.id;
              const subCount = countsByProcessorForModel[sub.id] ?? 0;

              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => {
                    setSelectedProcessor(sub.id);
                    setEditingId(null);
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
                    active
                      ? "bg-secondary text-white shadow-xs"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-secondary-fixed/60 hover:text-secondary"
                  )}
                >
                  <span>{sub.label}</span>
                  <span
                    className={cn(
                      "px-1.5 py-0.2 rounded-full text-[10px]",
                      active
                        ? "bg-white/20 text-white"
                        : "bg-white text-secondary"
                    )}
                  >
                    {subCount}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {notice && (
        <div className="bg-emerald-50 text-emerald-800 rounded-2xl px-4 py-3 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {notice}
        </div>
      )}

      {error && (
        <div className="bg-error-container text-error rounded-2xl px-4 py-3 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Inline Add New Procedure Card */}
      {isAdding && (
        <form
          onSubmit={handleCreateProcedure}
          className="bg-surface-container-lowest rounded-3xl p-6 ambient-shadow space-y-4 ring-2 ring-primary/20"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-headline font-bold text-base text-primary">
              Nuevo procedimiento para {selectedModel}
            </h2>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className={
                currentModelConfig.hasProcessorSubcategories
                  ? "sm:col-span-2"
                  : "sm:col-span-3"
              }
            >
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                Título del procedimiento
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={`Por ejemplo, Configurar APN en ${selectedModel}`}
                className="w-full rounded-2xl bg-surface-container-low px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40"
              />
            </div>

            {currentModelConfig.hasProcessorSubcategories && (
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  Procesadora
                </label>
                <select
                  value={newProcessor}
                  onChange={(e) => setNewProcessor(e.target.value)}
                  className="w-full rounded-2xl bg-surface-container-low px-4 py-3 text-sm font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 cursor-pointer"
                >
                  <option value="Credicard">Credicard</option>
                  <option value="Platco">Platco</option>
                  <option value="General">Ambas / General</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
              Pasos del procedimiento
            </label>
            <textarea
              rows={6}
              required
              value={newSteps}
              onChange={(e) => setNewSteps(e.target.value)}
              placeholder="1. Ingrese a FUNCIONES...&#10;2. Seleccione Configuración de sistema..."
              className="w-full rounded-2xl bg-surface-container-low px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 resize-y leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2.5 rounded-full text-xs font-semibold bg-surface-container-low text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold vati-gradient text-white cursor-pointer disabled:opacity-60"
            >
              {creating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Guardar procedimiento
            </button>
          </div>
        </form>
      )}

      {/* Selected Model Procedures Container */}
      <div className="bg-surface-container-lowest rounded-3xl p-6 sm:p-8 ambient-shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-headline font-extrabold text-xl text-on-surface">
              {selectedModel === "General"
                ? "Procedimientos Generales y Tablas"
                : `Procedimientos del Modelo ${selectedModel}`}
              {currentModelConfig.hasProcessorSubcategories &&
              selectedProcessor !== "ALL"
                ? ` · ${selectedProcessor}`
                : ""}
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {modelArticles.length} procedimientos en vista de lectura
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Buscar en ${selectedModel}...`}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-surface-container-low text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-secondary/40"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-sm text-on-surface-variant">
            <Loader2 className="w-4 h-4 animate-spin" />
            Cargando procedimientos...
          </div>
        ) : modelArticles.length === 0 ? (
          <div className="bg-surface-container-low rounded-2xl p-10 text-center space-y-3">
            <p className="font-headline font-bold text-sm text-on-surface">
              No hay procedimientos en {selectedModel}
              {selectedProcessor !== "ALL" ? ` (${selectedProcessor})` : ""}
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold vati-gradient text-white cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Añadir procedimiento aquí
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {modelArticles.map((article) => {
              const isEditingThis = editingId === article.id;
              const procLabel = getNormalizedProcessor(article);

              return (
                <div
                  key={article.id}
                  className="bg-surface-container-low rounded-2xl p-5 sm:p-6 space-y-3 transition-colors"
                >
                  {isEditingThis ? (
                    /* INLINE EDIT MODE */
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="sm:col-span-2 rounded-xl bg-white px-4 py-2.5 font-headline font-bold text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40"
                        />
                        {currentModelConfig.hasProcessorSubcategories && (
                          <select
                            value={editProcessor}
                            onChange={(e) => setEditProcessor(e.target.value)}
                            className="rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 cursor-pointer"
                          >
                            <option value="Credicard">Credicard</option>
                            <option value="Platco">Platco</option>
                            <option value="General">Ambas / General</option>
                          </select>
                        )}
                      </div>
                      <textarea
                        rows={7}
                        value={editSteps}
                        onChange={(e) => setEditSteps(e.target.value)}
                        className="w-full rounded-xl bg-white px-4 py-3 text-sm leading-relaxed text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/40 resize-y"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 rounded-full text-xs font-semibold bg-white text-on-surface-variant hover:text-on-surface cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          disabled={savingEdit}
                          onClick={() => handleSaveEdit(article.id)}
                          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold vati-gradient text-white cursor-pointer disabled:opacity-60"
                        >
                          {savingEdit ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Save className="w-3.5 h-3.5" />
                          )}
                          Guardar cambios
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* DEFAULT READING VIEW */
                    <>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-headline font-bold text-base text-primary">
                            {article.title}
                          </h3>
                          {procLabel !== "General" && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-secondary-fixed/80 text-secondary">
                              {procLabel}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEdit(article)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white text-primary hover:bg-primary-fixed transition-colors cursor-pointer shadow-2xs"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Editar
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === article.id}
                            onClick={() => handleDelete(article.id)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white text-error hover:bg-error-container/70 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                          >
                            {deletingId === article.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                            Eliminar
                          </button>
                        </div>
                      </div>

                      <div className="bg-white/80 rounded-xl p-4 text-sm text-on-surface whitespace-pre-line leading-relaxed">
                        {article.steps}
                      </div>

                      <p className="text-[11px] text-outline">
                        Última actualización:{" "}
                        {formatRelativeDate(article.updatedAt)}
                      </p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
