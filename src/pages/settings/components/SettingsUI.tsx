import type { ReactNode } from "react";

export function SettingsSection({
  title,
  icon,
  description,
  children,
}: {
  title: string;
  icon: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-background-200/70 px-4 py-5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
          <i className={`${icon} text-base`} />
        </span>
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground-950">{title}</h2>
          {description ? <p className="text-xs text-foreground-500">{description}</p> : null}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function ToggleRow({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-background-200/80 bg-background-50 px-3.5 py-3 text-left transition-colors hover:bg-background-100/60"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background-100 text-foreground-700">
        <i className={`${icon} text-lg`} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-foreground-950">{label}</span>
        <span className="block text-xs text-foreground-500">{description}</span>
      </span>
      <span
        className={`relative flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-primary-500" : "bg-background-300"
        }`}
      >
        <span
          className={`absolute h-5 w-5 rounded-full bg-background-50 transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-foreground-600">
      {children}
    </span>
  );
}