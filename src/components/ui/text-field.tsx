import type { InputHTMLAttributes } from "react";

export function TextField({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 ${className}`}
    />
  );
}
