import type { CreateTodo, UpdateTodo, TodoFilter } from "../contracts/todo";
import type { TodoRepository } from "./todo-repository";

export class TodoNotFoundError extends Error {
  constructor() {
    super("Todoが見つかりません。再読み込みしてください。");
  }
}

export function createTodoService(repository: TodoRepository) {
  return {
    list: (filter: TodoFilter) => repository.list(filter, 20),
    create: (input: CreateTodo) => repository.create(input),
    async update(id: number, input: UpdateTodo) {
      const todo = await repository.update(id, input);
      if (!todo) throw new TodoNotFoundError();
      return todo;
    },
    async remove(id: number) {
      if (!(await repository.remove(id))) throw new TodoNotFoundError();
    },
  };
}
