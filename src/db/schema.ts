import {
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

export const caseStatusEnum = pgEnum("case_status", [
  "open",
  "bot_handling",
  "waiting_agent",
  "in_progress",
  "resolved",
  "closed",
]);

export const casePriorityEnum = pgEnum("case_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

export const senderTypeEnum = pgEnum("sender_type", [
  "customer",
  "bot",
  "agent",
  "system",
]);

export const agents = pgTable("agents", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("agent"),
  isOnline: text("is_online").notNull().default("offline"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  documentId: text("document_id"),
  companyName: text("company_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cases = pgTable("cases", {
  id: uuid("id").defaultRandom().primaryKey(),
  ticketNumber: serial("ticket_number").notNull(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  assignedAgentId: uuid("assigned_agent_id").references(() => agents.id, {
    onDelete: "set null",
  }),
  gestionType: text("gestion_type").notNull().default("servicio_tecnico"),
  subCategory: text("sub_category"),
  subject: text("subject").notNull(),
  category: text("category").notNull().default("general"),
  deviceModel: text("device_model"),
  status: caseStatusEnum("status").notNull().default("bot_handling"),
  priority: casePriorityEnum("priority").notNull().default("medium"),
  metadata: jsonb("metadata").$type<Record<string, string>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  caseId: uuid("case_id")
    .notNull()
    .references(() => cases.id, { onDelete: "cascade" }),
  senderType: senderTypeEnum("sender_type").notNull(),
  senderName: text("sender_name"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const knowledgeArticles = pgTable("knowledge_articles", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  deviceModel: text("device_model").notNull().default("General"),
  processor: text("processor").notNull().default("General"),
  title: text("title").notNull(),
  symptoms: text("symptoms").notNull(),
  steps: text("steps").notNull(),
  helpfulCount: integer("helpful_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const knowledgeDocuments = pgTable("knowledge_documents", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type CaseRecord = typeof cases.$inferSelect;
export type CustomerRecord = typeof customers.$inferSelect;
export type MessageRecord = typeof messages.$inferSelect;
export type KnowledgeArticleRecord = typeof knowledgeArticles.$inferSelect;
export type KnowledgeDocumentRecord = typeof knowledgeDocuments.$inferSelect;
