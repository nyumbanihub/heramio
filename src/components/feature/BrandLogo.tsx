interface BrandLogoProps {
  variant?: "light" | "dark";
  className?: string;
}

/**
 * Heramio wordmark: an interlocking symbol (heart + trust link) beside the name.
 */
export default function BrandLogo({ variant = "dark", className = "" }: BrandLogoProps) {
  const textColor = variant === "light" ? "text-background-50" : "text-foreground-950";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500">
        <i className="ri-heart-3-fill text-[18px] leading-none text-background-50" />
        <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-background-50">
          <i className="ri-shield-check-fill text-[11px] leading-none text-primary-600" />
        </span>
      </span>
      <span className={`font-heading text-[22px] font-semibold leading-none tracking-tight ${textColor}`}>
        Heramio
      </span>
    </div>
  );
}