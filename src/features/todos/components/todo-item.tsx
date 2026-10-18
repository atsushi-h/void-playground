import { useRef, useState, type FormEvent } from "react";
import type { TodoDto } from "../contracts/todo";
import { titleSchema } from "../contracts/todo";
import { todoApi, errorMessage } from "../client/todo-api";
import { Button } from "../../../components/ui/button";
import { TextField } from "../../../components/ui/text-field";
import { FieldError } from "../../../components/ui/field-error";

export function TodoItem({ todo, onSaved }: { todo: TodoDto; onSaved: () => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  async function mutate(operation: () => Promise<unknown>) {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError(null);
    try {
      await operation();
      setEditing(false);
      await onSaved();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  function save(event: FormEvent) {
    event.preventDefault();
    const parsed = titleSchema.safeParse(title);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "入力を確認してください");
      return;
    }
    void mutate(() => todoApi.update(todo.id, { title: parsed.data }));
  }
  return (
    <li className="border-b border-slate-100 px-5 py-4 last:border-0" aria-busy={pending}>
      {editing ? (
        <form onSubmit={save} className="flex flex-wrap gap-2">
          <label className="sr-only" htmlFor={`edit-${todo.id}`}>
            タイトルを編集
          </label>
          <TextField
            id={`edit-${todo.id}`}
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            disabled={pending}
            aria-invalid={!!error}
            aria-describedby={`error-${todo.id}`}
            className="flex-1"
          />
          <Button disabled={pending} type="submit">
            保存
          </Button>
          <Button
            disabled={pending}
            type="button"
            onClick={() => {
              setEditing(false);
              setError(null);
            }}
          >
            キャンセル
          </Button>
        </form>
      ) : (
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={todo.completed}
            disabled={pending}
            onChange={(e) => {
              void mutate(() => todoApi.update(todo.id, { completed: e.target.checked }));
            }}
            aria-label={`${todo.title}を${todo.completed ? "未完了" : "完了"}にする`}
            className="size-5 shrink-0 accent-brand"
          />
          <span
            className={`min-w-0 flex-1 break-words text-sm ${todo.completed ? "text-slate-400 line-through" : "text-slate-800"}`}
          >
            {todo.title}
          </span>
          <Button
            disabled={pending}
            aria-label={`${todo.title}を編集`}
            onClick={() => {
              setTitle(todo.title);
              setEditing(true);
              setError(null);
            }}
            className="px-2 text-xs"
          >
            編集
          </Button>
          <Button
            disabled={pending}
            aria-label={`${todo.title}を削除`}
            onClick={() => {
              if (window.confirm(`「${todo.title}」を削除しますか？`))
                void mutate(() => todoApi.remove(todo.id));
            }}
            className="border-transparent px-2 text-xs text-slate-400 hover:text-rose-700"
          >
            削除
          </Button>
        </div>
      )}
      <FieldError id={`error-${todo.id}`} message={error} />
    </li>
  );
}
