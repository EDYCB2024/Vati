import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cases, customers } from "@/db/schema";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ ticketNumber: string }> }
) {
  try {
    const { ticketNumber } = await context.params;
    const numeric = Number(ticketNumber.replace(/[^0-9]/g, ""));

    if (!numeric || Number.isNaN(numeric)) {
      return NextResponse.json(
        { error: "Número de ticket inválido" },
        { status: 400 }
      );
    }

    const [row] = await db
      .select({
        id: cases.id,
        ticketNumber: cases.ticketNumber,
        gestionType: cases.gestionType,
        subCategory: cases.subCategory,
        subject: cases.subject,
        status: cases.status,
        priority: cases.priority,
        createdAt: cases.createdAt,
        updatedAt: cases.updatedAt,
        companyName: customers.companyName,
        customerName: customers.name,
      })
      .from(cases)
      .innerJoin(customers, eq(cases.customerId, customers.id))
      .where(eq(cases.ticketNumber, numeric))
      .limit(1);

    if (!row) {
      return NextResponse.json(
        { error: "No encontramos un ticket con ese número" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ticket: row });
  } catch (error) {
    console.error("GET /api/tickets/[ticketNumber] error:", error);
    return NextResponse.json(
      { error: "Error al consultar el ticket" },
      { status: 500 }
    );
  }
}
