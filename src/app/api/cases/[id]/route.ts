import { NextRequest, NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { cases, customers, messages } from "@/db/schema";

const patchCaseSchema = z.object({
  status: z
    .enum([
      "open",
      "bot_handling",
      "waiting_agent",
      "in_progress",
      "resolved",
      "closed",
    ])
    .optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
});

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const [row] = await db
      .select({
        id: cases.id,
        ticketNumber: cases.ticketNumber,
        gestionType: cases.gestionType,
        subCategory: cases.subCategory,
        subject: cases.subject,
        deviceModel: cases.deviceModel,
        status: cases.status,
        priority: cases.priority,
        metadata: cases.metadata,
        createdAt: cases.createdAt,
        updatedAt: cases.updatedAt,
        customer: {
          id: customers.id,
          name: customers.name,
          companyName: customers.companyName,
          documentId: customers.documentId,
          phone: customers.phone,
          email: customers.email,
        },
      })
      .from(cases)
      .innerJoin(customers, eq(cases.customerId, customers.id))
      .where(eq(cases.id, id))
      .limit(1);

    if (!row) {
      return NextResponse.json(
        { error: "Caso no encontrado" },
        { status: 404 }
      );
    }

    const caseMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.caseId, id))
      .orderBy(asc(messages.createdAt));

    return NextResponse.json({ case: row, messages: caseMessages });
  } catch (error) {
    console.error("GET /api/cases/[id] error:", error);
    return NextResponse.json(
      { error: "Error al obtener detalle del caso" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = patchCaseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    if (parsed.data.status) updates.status = parsed.data.status;
    if (parsed.data.priority) updates.priority = parsed.data.priority;

    const [updated] = await db
      .update(cases)
      .set(updates)
      .where(eq(cases.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Caso no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ case: updated });
  } catch (error) {
    console.error("PATCH /api/cases/[id] error:", error);
    return NextResponse.json(
      { error: "Error al actualizar el caso" },
      { status: 500 }
    );
  }
}
