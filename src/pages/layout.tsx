import type { ReactNode } from "react";
import "../styles/app.css";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-7">
        <span
          className="flex size-9 items-center justify-center rounded-xl bg-brand text-lg font-bold text-white"
          aria-hidden="true"
        >
          ✓
        </span>
        <span className="font-semibold tracking-tight">
          Todo<span className="ml-2 text-xs font-normal text-slate-400">WORKSPACE</span>
        </span>
      </header>
      <main className="mx-auto max-w-3xl px-5 pb-16">{children}</main>
    </>
  );
}
