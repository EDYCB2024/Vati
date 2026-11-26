import { NextRequest, NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { knowledgeArticles, knowledgeDocuments } from "@/db/schema";

const DOC_SLUG = "manual_pos_por_modelo";

const MODEL_ORDER = [
  "General",
  "N910",
  "N950",
  "N750",
  "ME60",
  "SP600",
  "M51",
] as const;

const updateDocumentSchema = z.object({
  title: z.string().min(2, "El título es requerido"),
  sectionsByModel: z.record(z.string(), z.string()),
});

function normalizeModel(rawModel: string, titleAndBody: string): string {
  const upper = `${rawModel} ${titleAndBody}`.toUpperCase();
  if (rawModel.includes("/")) return "General";
  if (MODEL_ORDER.includes(rawModel as (typeof MODEL_ORDER)[number])) {
    return rawModel;
  }
  if (upper.includes("N910")) return "N910";
  if (upper.includes("N950")) return "N950";
  if (upper.includes("N750")) return "N750";
  if (upper.includes("ME60")) return "ME60";
  if (upper.includes("SP600")) return "SP600";
  if (upper.includes("M51")) return "M51";
  return "General";
}

function detectProcessor(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("platco")) return "Platco";
  if (lower.includes("credicard") || lower.includes("ccr")) {
    return "Credicard";
  }
  return "General";
}

function serializeModelSections(sectionsByModel: Record<string, string>): string {
  const orderedKeys = [
    ...MODEL_ORDER.filter((m) => sectionsByModel[m]?.trim()),
    ...Object.keys(sectionsByModel).filter(
      (k) =>
        !MODEL_ORDER.includes(k as (typeof MODEL_ORDER)[number]) &&
        sectionsByModel[k]?.trim()
    ),
  ];

  return orderedKeys
    .map((model) => `# MODELO: ${model}\n\n${sectionsByModel[model].trim()}`)
    .join("\n\n===\n\n");
}

function deserializeModelSections(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const m of MODEL_ORDER) {
    result[m] = "";
  }

  const blocks = content
    .split(/\n===\n/g)
    .map((b) => b.trim())
    .filter(Boolean);

  for (const block of blocks) {
    const match = block.match(/^#\s*MODELO:\s*([^\n]+)\n+([\s\S]*)$/i);
    if (match) {
      const modelName = match[1].trim();
      result[modelName] = match[2].trim();
    }
  }

  return result;
}

function parseModelSectionsToArticles(sectionsByModel: Record<string, string>) {
  const articles: {
    title: string;
    category: string;
    deviceModel: string;
    processor: string;
    symptoms: string;
    steps: string;
  }[] = [];

  for (const [model, modelContent] of Object.entries(sectionsByModel)) {
    if (!modelContent?.trim()) continue;

    const rawBlocks = modelContent
      .split(/\n(?=##\s+)/g)
      .map((b) => b.trim())
      .filter(Boolean);

    for (const block of rawBlocks) {
      const lines = block.split("\n");
      const firstLine = lines[0]
        .replace(/^#+\s*/, "")
        .replace(/\s*\[.*?\]$/, "")
        .trim();
      const body = lines
        .slice(1)
        .join("\n")
        .replace(/\n*---\s*$/, "")
        .trim();

      if (!firstLine || !body) continue;

      const processor = detectProcessor(`${firstLine}\n${body}`);

      articles.push({
        title: firstLine,
        category: "Procedimiento Técnico",
        deviceModel: model,
        processor,
        symptoms: `${firstLine.toLowerCase()} ${model.toLowerCase()} ${processor.toLowerCase()}`,
        steps: body,
      });
    }
  }

  return articles;
}

export async function GET() {
  try {
    const [existing] = await db
      .select()
      .from(knowledgeDocuments)
      .where(eq(knowledgeDocuments.slug, DOC_SLUG))
      .limit(1);

    if (existing) {
      return NextResponse.json({
        document: existing,
        models: MODEL_ORDER,
        sectionsByModel: deserializeModelSections(existing.content),
      });
    }

    // Build initial document divided strictly by Model (not by processor)
    const articles = await db
      .select()
      .from(knowledgeArticles)
      .orderBy(asc(knowledgeArticles.id));

    const grouped: Record<string, string[]> = {};
    for (const m of MODEL_ORDER) {
      grouped[m] = [];
    }

    for (const a of articles) {
      const cleanTitle = a.title.replace(/\s*\[.*?\]$/, "").trim();
      const model = normalizeModel(a.deviceModel, `${cleanTitle}\n${a.steps}`);
      if (!grouped[model]) grouped[model] = [];
      grouped[model].push(`## ${cleanTitle}\n\n${a.steps.trim()}`);
    }

    const sectionsByModel: Record<string, string> = {};
    for (const m of MODEL_ORDER) {
      sectionsByModel[m] = (grouped[m] || []).join("\n\n---\n\n");
    }

    const compiledContent = serializeModelSections(sectionsByModel);

    const [created] = await db
      .insert(knowledgeDocuments)
      .values({
        slug: DOC_SLUG,
        title: "Manual de Procedimientos Técnicos POS 2026",
        content: compiledContent,
      })
      .returning();

    return NextResponse.json({
      document: created,
      models: MODEL_ORDER,
      sectionsByModel,
    });
  } catch (error) {
    console.error("GET /api/knowledge/document error:", error);
    return NextResponse.json(
      { error: "No se pudo cargar el documento" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = updateDocumentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const compiledContent = serializeModelSections(parsed.data.sectionsByModel);

    const [existing] = await db
      .select()
      .from(knowledgeDocuments)
      .where(eq(knowledgeDocuments.slug, DOC_SLUG))
      .limit(1);

    let savedDoc;
    if (existing) {
      const [updated] = await db
        .update(knowledgeDocuments)
        .set({
          title: parsed.data.title.trim(),
          content: compiledContent,
          updatedAt: new Date(),
        })
        .where(eq(knowledgeDocuments.slug, DOC_SLUG))
        .returning();
      savedDoc = updated;
    } else {
      const [created] = await db
        .insert(knowledgeDocuments)
        .values({
          slug: DOC_SLUG,
          title: parsed.data.title.trim(),
          content: compiledContent,
        })
        .returning();
      savedDoc = created;
    }

    const articles = parseModelSectionsToArticles(parsed.data.sectionsByModel);
    if (articles.length > 0) {
      await db.delete(knowledgeArticles);
      await db.insert(knowledgeArticles).values(articles);
    }

    return NextResponse.json({
      document: savedDoc,
      sectionsByModel: parsed.data.sectionsByModel,
      syncedSections: articles.length,
    });
  } catch (error) {
    console.error("PUT /api/knowledge/document error:", error);
    return NextResponse.json(
      { error: "No se pudo guardar el documento en Neon" },
      { status: 500 }
    );
  }
}
