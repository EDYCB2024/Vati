import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { knowledgeArticles } from "@/db/schema";

const updateArticleSchema = z.object({
  title: z.string().min(2).optional(),
  category: z.string().min(2).optional(),
  deviceModel: z.string().min(1).optional(),
  processor: z.string().min(1).optional(),
  symptoms: z.string().min(2).optional(),
  steps: z.string().min(5).optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);
    if (!numericId || Number.isNaN(numericId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = updateArticleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(knowledgeArticles)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(knowledgeArticles.id, numericId))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Procedimiento no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ article: updated });
  } catch (error) {
    console.error("PATCH /api/knowledge/[id] error:", error);
    return NextResponse.json(
      { error: "No se pudo actualizar el procedimiento" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);
    if (!numericId || Number.isNaN(numericId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const [deleted] = await db
      .delete(knowledgeArticles)
      .where(eq(knowledgeArticles.id, numericId))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: "Procedimiento no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/knowledge/[id] error:", error);
    return NextResponse.json(
      { error: "No se pudo eliminar el procedimiento" },
      { status: 500 }
    );
  }
}
