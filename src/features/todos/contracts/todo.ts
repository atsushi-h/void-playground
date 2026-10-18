import { z } from "zod";

export const titleSchema = z
  .string()
  .trim()
  .min(1, "タイトルを入力してください")
  .max(200, "タイトルは200文字以内で入力してください");
export const createTodoSchema = z.strictObject({ title: titleSchema });
export const updateTodoSchema = z
  .strictObject({
    title: titleSchema.optional(),
    completed: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "更新内容を指定してください");
export const todoIdSchema = z.object({
  id: z
    .string()
    .regex(/^[1-9]\d*$/, "IDが不正です")
    .refine((value) => Number.isSafeInteger(Number(value)), "IDが不正です"),
});
export const listTodosSchema = z.object({
  status: z.enum(["all", "active", "completed"]).default("all"),
  page: z
    .string()
    .regex(/^[1-9]\d*$/)
    .refine((value) => Number(value) <= 100000, "ページが範囲外です")
    .default("1"),
});
export type CreateTodo = z.infer<typeof createTodoSchema>;
export type UpdateTodo = z.infer<typeof updateTodoSchema>;
export type TodoFilter = z.infer<typeof listTodosSchema>;
export interface TodoDto {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface TodoPage {
  items: TodoDto[];
  total: number;
  activeCount: number;
  page: number;
  pageSize: number;
}
