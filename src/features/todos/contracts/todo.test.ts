import { describe, expect, test } from "bun:test";
import { createTodoSchema, updateTodoSchema, todoIdSchema, listTodosSchema } from "./todo";

describe("Todo input contracts", () => {
  test("trims titles and accepts the boundary length", () => {
    expect(createTodoSchema.parse({ title: "  買い物  " })).toEqual({ title: "買い物" });
    expect(createTodoSchema.safeParse({ title: "a".repeat(200) }).success).toBe(true);
  });
  test.each(["", "   ", "a".repeat(201)])("rejects invalid title %j", (title) => {
    expect(createTodoSchema.safeParse({ title }).success).toBe(false);
  });
  test("rejects server-controlled columns and invalid updates", () => {
    expect(createTodoSchema.safeParse({ title: "a", id: 1 }).success).toBe(false);
    for (const value of [{}, { completed: "true" }, { updatedAt: "now" }, { title: " " }]) {
      expect(updateTodoSchema.safeParse(value).success).toBe(false);
    }
    expect(updateTodoSchema.parse({ completed: false })).toEqual({ completed: false });
  });
  test.each(["0", "-1", "1.5", "abc", "9007199254740992"])("rejects invalid id %s", (id) => {
    expect(todoIdSchema.safeParse({ id }).success).toBe(false);
  });
  test("validates filters and defaults", () => {
    expect(listTodosSchema.parse({})).toEqual({ status: "all", page: "1" });
    expect(listTodosSchema.safeParse({ status: "unknown" }).success).toBe(false);
    expect(listTodosSchema.safeParse({ page: "0" }).success).toBe(false);
    expect(listTodosSchema.safeParse({ page: "100001" }).success).toBe(false);
  });
});
