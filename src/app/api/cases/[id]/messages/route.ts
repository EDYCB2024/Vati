import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { cases, messages } from "@/db/schema";

const messageSchema = z.object({
  senderType: z.enum(["customer", "bot", "agent", "system"]).default("agent"),
  senderName: z.string().min(1).default("Agente de Soporte"),
  content: z.string().min(1, "El mensaje no puede estar vacío"),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = messageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Mensaje inválido", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select({ id: cases.id, status: cases.status })
      .from(cases)
      .where(eq(cases.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Caso no encontrado" },
        { status: 404 }
      );
    }

    const [created] = await db
      .insert(messages)
      .values({
        caseId: id,
        senderType: parsed.data.senderType,
        senderName: parsed.data.senderName,
        content: parsed.data.content,
      })
      .returning();

    const nextStatus =
      parsed.data.senderType === "agent" && existing.status === "waiting_agent"
        ? "in_progress"
        : existing.status;

    await db
      .update(cases)
      .set({ status: nextStatus, updatedAt: new Date() })
      .where(eq(cases.id, id));

    return NextResponse.json({ message: created, status: nextStatus }, { status: 201 });
  } catch (error) {
    console.error("POST /api/cases/[id]/messages error:", error);
    return NextResponse.json(
      { error: "No se pudo enviar el mensaje" },
      { status: 500 }
    );
  }
}
