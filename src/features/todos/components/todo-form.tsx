import { useRef, useState, type FormEvent } from "react";
import { createTodoSchema } from "../contracts/todo";
import { todoApi, errorMessage } from "../client/todo-api";
import { Button } from "../../../components/ui/button";
import { TextField } from "../../../components/ui/text-field";
import { FieldError } from "../../../components/ui/field-error";

export function TodoForm({ onSaved }: { onSaved: () => Promise<void> }) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const submitting = useRef(false);
  const input = useRef<HTMLInputElement>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const parsed = createTodoSchema.safeParse({ title });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "入力を確認してください");
      return;
    }
    submitting.current = true;
    setPending(true);
    setError(null);
    try {
      await todoApi.create(parsed.data);
      setTitle("");
      await onSaved();
      input.current?.focus();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }
  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      aria-busy={pending}
    >
      <label htmlFor="new-title" className="mb-3 block text-sm font-medium">
        新しいやること
      </label>
      <div className="flex gap-2">
        <TextField
          ref={input}
          id="new-title"
          name="title"
          placeholder="今日は何を進めますか？"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={pending}
          maxLength={200}
          aria-invalid={!!error}
          aria-describedby="create-error"
          className="flex-1"
        />
        <Button type="submit" disabled={pending} variant="primary">
          {pending ? "追加中…" : "＋ 追加"}
        </Button>
      </div>
      <FieldError id="create-error" message={error} />
    </form>
  );
}
