import type { CreateTodo, UpdateTodo, TodoDto, TodoPage, TodoFilter } from "../contracts/todo";

export interface TodoRepository {
  list(filter: TodoFilter, pageSize: number): Promise<TodoPage>;
  create(input: CreateTodo): Promise<TodoDto>;
  update(id: number, input: UpdateTodo): Promise<TodoDto | undefined>;
  remove(id: number): Promise<boolean>;
}
