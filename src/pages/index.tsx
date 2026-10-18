import { Link, useRouter } from "@void/react";
import { useState } from "react";
import type { Props } from "./index.server";
import { TodoForm } from "../features/todos/components/todo-form";
import { TodoItem } from "../features/todos/components/todo-item";
import { Button } from "../components/ui/button";

export default function TodoPage({ result, filter, loadError }: Props) {
  const router = useRouter();
  const [notice, setNotice] = useState("");
  async function refresh() {
    setNotice("保存しました。");
    try {
      await router.refresh();
    } catch {
      setNotice("保存は完了しましたが、一覧の再取得に失敗しました。再読み込みしてください。");
    }
  }
  const tabs = [
    { status: "all", label: "すべて" },
    { status: "active", label: "未完了" },
    { status: "completed", label: "完了" },
  ] as const;
  return (
    <>
      <div className="pb-7 pt-6">
        <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-brand">
          ONE THING AT A TIME
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">今日のやること</h1>
        <p className="mt-3 text-sm text-slate-500">
          ひとつずつ、着実に。やることを整理して、次の一歩へ。
        </p>
      </div>
      <TodoForm onSaved={refresh} />
      <div className="my-6 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Todoの絞り込み" className="flex gap-1 rounded-xl bg-slate-200/60 p-1">
          {tabs.map((tab) => (
            <Link
              key={tab.status}
              href={`/?status=${tab.status}`}
              preserveScroll
              aria-current={filter.status === tab.status ? "page" : undefined}
              className={`rounded-lg px-4 py-2 text-sm transition ${filter.status === tab.status ? "bg-white font-medium text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        {result && (
          <p className="text-sm text-slate-500">
            未完了 <span className="font-semibold text-brand">{result.activeCount}</span> 件
          </p>
        )}
      </div>
      {loadError ? (
        <section role="alert" className="rounded-2xl border border-rose-200 bg-white p-7">
          <p className="mb-4 text-sm text-rose-700">{loadError}</p>
          <Button
            onClick={() => {
              void router
                .refresh()
                .catch(() => setNotice("読み込めませんでした。再試行してください。"));
            }}
          >
            再試行
          </Button>
        </section>
      ) : (
        result && (
          <section
            aria-label="Todo一覧"
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            {result.items.length ? (
              <ul>
                {result.items.map((todo) => (
                  <TodoItem key={todo.id} todo={todo} onSaved={refresh} />
                ))}
              </ul>
            ) : (
              <div className="px-6 py-14 text-center">
                <span
                  className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-emerald-50 text-xl text-brand"
                  aria-hidden="true"
                >
                  ✓
                </span>
                <h2 className="text-sm font-semibold">
                  {filter.status === "completed"
                    ? "完了したTodoはまだありません"
                    : filter.status === "active"
                      ? "未完了のTodoはありません"
                      : "やることを追加してみましょう"}
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  {filter.status === "all"
                    ? "上の入力欄から、最初の一件を。"
                    : "絞り込みを変えると、ほかのTodoを確認できます。"}
                </p>
              </div>
            )}
            {result.total > result.pageSize && (
              <nav
                aria-label="ページ切り替え"
                className="flex items-center justify-between border-t border-slate-100 p-4 text-sm"
              >
                {result.page > 1 ? (
                  <Link
                    preserveScroll
                    href={`/?status=${filter.status}&page=${result.page - 1}`}
                    className="text-brand"
                  >
                    ← 前へ
                  </Link>
                ) : (
                  <span />
                )}
                <span className="text-slate-500">
                  {result.page} / {Math.ceil(result.total / result.pageSize)}
                </span>
                {result.page * result.pageSize < result.total ? (
                  <Link
                    preserveScroll
                    href={`/?status=${filter.status}&page=${result.page + 1}`}
                    className="text-brand"
                  >
                    次へ →
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            )}
          </section>
        )
      )}
      <p role="status" aria-live="polite" className="mt-4 min-h-5 text-center text-sm text-brand">
        {notice}
      </p>
      <p className="mt-7 text-center text-xs text-slate-400">
        追加・保存した内容は、次に開いたときも残ります。
      </p>
    </>
  );
}
