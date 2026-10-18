import { todos } from "@schema";
import { count, desc, eq, type DrizzleD1Database } from "void/db";
import type { TodoRepository } from "./todo-repository";
import type { TodoDto } from "../contracts/todo";

// Explicit mapping keeps new database columns out of public responses.
function toDto(row: typeof todos.$inferSelect): TodoDto {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function createD1TodoRepository(
  db: DrizzleD1Database<typeof import("../../../db/schema")>,
): TodoRepository {
  return {
    async list(filter, pageSize) {
      const condition =
        filter.status === "all" ? undefined : eq(todos.completed, filter.status === "completed");
      const [totalRow] = await db.select({ value: count() }).from(todos).where(condition);
      const [activeRow] = await db
        .select({ value: count() })
        .from(todos)
        .where(eq(todos.completed, false));
      const total = totalRow?.value ?? 0;
      const page = Math.min(Number(filter.page), Math.max(1, Math.ceil(total / pageSize)));
      const rows = await db
        .select()
        .from(todos)
        .where(condition)
        .orderBy(desc(todos.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize);
      return { items: rows.map(toDto), total, activeCount: activeRow?.value ?? 0, page, pageSize };
    },
    async create(input) {
      const [row] = await db.insert(todos).values({ title: input.title }).returning();
      if (!row) throw new Error("Insert did not return a Todo");
      return toDto(row);
    },
    async update(id, input) {
      const [row] = await db
        .update(todos)
        .set({ ...input, updatedAt: new Date().toISOString() })
        .where(eq(todos.id, id))
        .returning();
      return row ? toDto(row) : undefined;
    },
    async remove(id) {
      const rows = await db.delete(todos).where(eq(todos.id, id)).returning({ id: todos.id });
      return rows.length > 0;
    },
  };
}
