import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "primary" };
export function Button({ className = "", variant = "default", ...props }: Props) {
  const colors =
    variant === "primary"
      ? "border-transparent bg-brand text-white hover:bg-emerald-800"
      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100";
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium transition disabled:cursor-wait disabled:opacity-50 ${colors} ${className}`}
    />
  );
}
