import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { cases, customers, messages } from "@/db/schema";

const createCaseSchema = z.object({
  customerName: z.string().min(1, "El nombre es requerido"),
  companyName: z.string().optional(),
  documentId: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  gestionType: z.string().min(1),
  subCategory: z.string().optional(),
  subject: z.string().min(1),
  deviceModel: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  status: z
    .enum([
      "open",
      "bot_handling",
      "waiting_agent",
      "in_progress",
      "resolved",
      "closed",
    ])
    .default("waiting_agent"),
  metadata: z.record(z.string(), z.string()).optional(),
  transcript: z
    .array(
      z.object({
        senderType: z.enum(["customer", "bot", "agent", "system"]),
        senderName: z.string().optional(),
        content: z.string(),
      })
    )
    .optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const gestionFilter = searchParams.get("gestionType");
    const search = searchParams.get("search")?.trim().toLowerCase();

    const rows = await db
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
      .orderBy(desc(cases.createdAt));

    const stats = {
      total: rows.length,
      waitingAgent: rows.filter((r) => r.status === "waiting_agent").length,
      inProgress: rows.filter((r) => r.status === "in_progress").length,
      resolved: rows.filter(
        (r) => r.status === "resolved" || r.status === "closed"
      ).length,
      byGestion: rows.reduce<Record<string, number>>((acc, row) => {
        acc[row.gestionType] = (acc[row.gestionType] || 0) + 1;
        return acc;
      }, {}),
    };

    const filtered = rows.filter((row) => {
      if (statusFilter && statusFilter !== "all" && row.status !== statusFilter) {
        return false;
      }
      if (
        gestionFilter &&
        gestionFilter !== "all" &&
        row.gestionType !== gestionFilter
      ) {
        return false;
      }
      if (search) {
        const haystack = [
          `vtc-${String(row.ticketNumber).padStart(4, "0")}`,
          String(row.ticketNumber),
          row.subject,
          row.subCategory ?? "",
          row.customer.name,
          row.customer.companyName ?? "",
          row.customer.documentId ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });

    return NextResponse.json({ cases: filtered, stats });
  } catch (error) {
    console.error("GET /api/cases error:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los casos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createCaseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const [createdCustomer] = await db
      .insert(customers)
      .values({
        name: data.customerName,
        companyName: data.companyName || null,
        documentId: data.documentId || null,
        phone: data.phone || null,
        email: data.email || null,
      })
      .returning();

    const [createdCase] = await db
      .insert(cases)
      .values({
        customerId: createdCustomer.id,
        gestionType: data.gestionType,
        subCategory: data.subCategory || null,
        subject: data.subject,
        category: data.gestionType,
        deviceModel: data.deviceModel || null,
        priority: data.priority,
        status: data.status,
        metadata: data.metadata ?? {},
      })
      .returning();

    if (data.transcript && data.transcript.length > 0) {
      await db.insert(messages).values(
        data.transcript.map((msg) => ({
          caseId: createdCase.id,
          senderType: msg.senderType,
          senderName:
            msg.senderName ||
            (msg.senderType === "bot" ? "Vati" : data.customerName),
          content: msg.content,
        }))
      );
    }

    return NextResponse.json(
      {
        case: createdCase,
        customer: createdCustomer,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/cases error:", error);
    return NextResponse.json(
      { error: "Error al crear el caso en la base de datos" },
      { status: 500 }
    );
  }
}
