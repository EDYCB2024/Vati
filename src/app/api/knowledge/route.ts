import { NextRequest, NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { knowledgeArticles } from "@/db/schema";

const createArticleSchema = z.object({
  title: z.string().min(2, "El título es requerido"),
  deviceModel: z.string().min(1, "El modelo es requerido"),
  steps: z.string().min(5, "Ingresa los pasos del procedimiento"),
  category: z.string().optional(),
  processor: z.string().optional(),
  symptoms: z.string().optional(),
});

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function detectProcessor(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("platco")) return "Platco";
  if (lower.includes("credicard") || lower.includes("ccr")) {
    return "Credicard";
  }
  return "General";
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() ?? "";
    const deviceModel = searchParams.get("deviceModel") ?? "all";

    const rows = await db
      .select()
      .from(knowledgeArticles)
      .orderBy(asc(knowledgeArticles.id));

    const tokens = search
      ? normalizeText(search)
          .split(/\s+/)
          .filter((t) => t.length >= 2)
      : [];

    const filtered = rows
      .filter((row) => {
        if (deviceModel !== "all") {
          const normalizedRowModel = row.deviceModel.includes("/")
            ? "General"
            : row.deviceModel;
          if (normalizedRowModel !== deviceModel) return false;
        }
        if (tokens.length === 0) return true;

        const haystack = normalizeText(
          `${row.title} ${row.deviceModel} ${row.processor} ${row.category} ${row.symptoms} ${row.steps}`
        );
        return tokens.every((token) => haystack.includes(token));
      })
      .map((row) => {
        if (tokens.length === 0) return { row, score: 0 };
        const titleNorm = normalizeText(row.title);
        const sympNorm = normalizeText(row.symptoms);
        let score = 0;
        for (const t of tokens) {
          if (titleNorm.includes(t)) score += 3;
          if (sympNorm.includes(t)) score += 2;
          if (normalizeText(row.deviceModel).includes(t)) score += 2;
        }
        return { row, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((item) => item.row);

    return NextResponse.json({
      articles: filtered,
      total: rows.length,
    });
  } catch (error) {
    console.error("GET /api/knowledge error:", error);
    return NextResponse.json(
      { error: "No se pudo cargar la base de conocimiento" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createArticleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const title = parsed.data.title.trim();
    const steps = parsed.data.steps.trim();
    const deviceModel = parsed.data.deviceModel.trim();
    const processor =
      parsed.data.processor?.trim() || detectProcessor(`${title}\n${steps}`);
    const category = parsed.data.category?.trim() || "Procedimiento Técnico";
    const symptoms =
      parsed.data.symptoms?.trim() ||
      `${title.toLowerCase()} ${deviceModel.toLowerCase()} ${processor.toLowerCase()}`;

    const [created] = await db
      .insert(knowledgeArticles)
      .values({
        title,
        category,
        deviceModel,
        processor,
        symptoms,
        steps,
      })
      .returning();

    return NextResponse.json({ article: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/knowledge error:", error);
    return NextResponse.json(
      { error: "No se pudo crear el procedimiento" },
      { status: 500 }
    );
  }
}
