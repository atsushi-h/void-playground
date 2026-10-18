import { describe, expect, test, mock } from "bun:test";
import { createTodoService, TodoNotFoundError } from "./todo-service";
import type { TodoRepository } from "./todo-repository";
import type { TodoDto } from "../contracts/todo";

const todo: TodoDto = {
  id: 1,
  title: "test",
  completed: false,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};
function repository(): TodoRepository {
  return {
    list: mock(async (_filter, pageSize) => ({
      items: [todo],
      total: 1,
      activeCount: 1,
      page: 1,
      pageSize,
    })),
    create: mock(async () => todo),
    update: mock(async () => todo),
    remove: mock(async () => true),
  };
}
describe("Todo service", () => {
  test("missing update is a domain error", async () => {
    const repo = repository();
    repo.update = async () => undefined;
    await expect(createTodoService(repo).update(404, { title: "new" })).rejects.toBeInstanceOf(
      TodoNotFoundError,
    );
  });
  test("missing delete is a domain error", async () => {
    const repo = repository();
    repo.remove = async () => false;
    await expect(createTodoService(repo).remove(404)).rejects.toBeInstanceOf(TodoNotFoundError);
  });
  test("keeps list bounds in the service and passes the filter", async () => {
    const repo = repository();
    const result = await createTodoService(repo).list({ status: "active", page: "2" });
    expect(repo.list).toHaveBeenCalledWith({ status: "active", page: "2" }, 20);
    expect(result.pageSize).toBe(20);
  });
});
