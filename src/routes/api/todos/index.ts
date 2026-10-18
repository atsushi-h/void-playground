import { defineHandler } from "void";
import { createTodoSchema, listTodosSchema } from "../../../features/todos/contracts/todo";
import { getTodoService } from "../../../server/composition";
import { apiOperation } from "../../../server/api-errors";

export const GET = defineHandler.withValidator({ query: listTodosSchema })(async (c, { query }) => {
  c.header("Cache-Control", "no-store");
  return apiOperation(() => getTodoService().list(query));
});
export const POST = defineHandler.withValidator({ body: createTodoSchema })(async (c, { body }) => {
  const todo = await apiOperation(() => getTodoService().create(body));
  return c.json(todo, 201);
});
