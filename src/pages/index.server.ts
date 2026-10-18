import { defineHandler, defineHead, type InferProps } from "void";
import { listTodosSchema } from "../features/todos/contracts/todo";
import { getTodoService } from "../server/composition";

export const loader = defineHandler(async (c) => {
  c.header("Cache-Control", "no-store");
  const parsed = listTodosSchema.safeParse(c.req.query());
  const filter = parsed.success ? parsed.data : listTodosSchema.parse({});
  try {
    return { result: await getTodoService().list(filter), filter, loadError: null };
  } catch (error) {
    console.error("Todo loader failed", error);
    return { result: null, filter, loadError: "Todoを読み込めませんでした。再試行してください。" };
  }
});
export type Props = InferProps<typeof loader>;
export const head = defineHead(() => ({
  title: "Todo — 今日のやること",
  htmlAttrs: { lang: "ja" },
  meta: [{ name: "viewport", content: "width=device-width, initial-scale=1" }],
}));
