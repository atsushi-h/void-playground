import { defineHandler } from "void";
import { todoIdSchema, updateTodoSchema } from "../../../features/todos/contracts/todo";
import { getTodoService } from "../../../server/composition";
import { apiOperation } from "../../../server/api-errors";

export const PATCH = defineHandler.withValidator({ params: todoIdSchema, body: updateTodoSchema })(
  async (_c, { params, body }) => {
    return apiOperation(() => getTodoService().update(Number(params.id), body));
  },
);
export const DELETE = defineHandler.withValidator({ params: todoIdSchema })(async (
  c,
  { params },
) => {
  await apiOperation(() => getTodoService().remove(Number(params.id)));
  return c.body(null, 204);
});
