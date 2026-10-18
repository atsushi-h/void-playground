import { fetch, FetchError } from "void/client";
import type { CreateTodo, UpdateTodo } from "../contracts/todo";

export const todoApi = {
  create: (body: CreateTodo) => fetch("/api/todos", { method: "POST", body }),
  update: (id: number, body: UpdateTodo) =>
    fetch("/api/todos/:id", { method: "PATCH", params: { id: String(id) }, body }),
  remove: (id: number) => fetch("/api/todos/:id", { method: "DELETE", params: { id: String(id) } }),
};
export function errorMessage(error: unknown): string {
  if (error instanceof FetchError) {
    if (error.status === 400) return "入力内容を確認してください。";
    const data: unknown = error.data;
    if (
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof data.error === "string"
    )
      return data.error;
  }
  return "通信に失敗しました。接続を確認し、再度お試しください。";
}
