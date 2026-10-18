import { HTTPException } from "hono/http-exception";
import { TodoNotFoundError } from "../features/todos/server/todo-service";

export async function apiOperation<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof TodoNotFoundError) {
      throw new HTTPException(404, {
        res: Response.json({ error: error.message, code: "TODO_NOT_FOUND" }, { status: 404 }),
      });
    }
    console.error("Todo operation failed", error);
    throw new HTTPException(500, {
      res: Response.json(
        { error: "処理に失敗しました。時間をおいて再度お試しください。", code: "INTERNAL_ERROR" },
        { status: 500 },
      ),
    });
  }
}
