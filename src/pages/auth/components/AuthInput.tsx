import type { InputHTMLAttributes } from "react";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: string;
}

export default function AuthInput({
  label,
  icon,
  id,
  className = "",
  ...rest
}: AuthInputProps) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-foreground-600">
        {label}
      </span>
      <span className="relative flex items-center">
        <i
          className={`${icon} pointer-events-none absolute left-3 text-base text-foreground-400`}
        />
        <input
          id={id}
          className={`w-full rounded-md border border-background-300 bg-background-50 py-2.5 pl-10 pr-3 text-sm text-foreground-900 transition-all duration-200 placeholder:text-foreground-400 hover:border-background-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 ${className}`}
          {...rest}
        />
      </span>
    </label>
  );
}