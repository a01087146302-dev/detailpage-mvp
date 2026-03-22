import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

export function Panel({
  className,
  children
}: PropsWithChildren<{ className?: string }>) {
  return (
    <section className={cn("rounded-[28px] border border-white/60 bg-white/85 p-5 shadow-panel backdrop-blur", className)}>
      {children}
    </section>
  );
}

export function SectionTitle({
  title,
  description
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
    </div>
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-ink",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-ink",
        className
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-ink",
        className
      )}
      {...props}
    />
  );
}

export function Button({
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const variantClass =
    variant === "primary"
      ? "bg-ink text-white hover:bg-slate-800"
      : variant === "secondary"
        ? "bg-clay text-white hover:opacity-90"
        : variant === "danger"
          ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200";

  return (
    <button
      className={cn(
        "rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variantClass,
        className
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  children
}: PropsWithChildren<{ label: string }>) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  );
}
