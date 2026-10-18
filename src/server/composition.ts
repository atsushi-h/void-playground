import { db } from "void/db";
import { createD1TodoRepository } from "../features/todos/server/d1-todo-repository";
import { createTodoService } from "../features/todos/server/todo-service";

export function getTodoService() {
  return createTodoService(createD1TodoRepository(db));
}
