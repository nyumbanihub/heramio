interface BrandLogoProps {
  variant?: "light" | "dark";
  className?: string;
}

export default function BrandLogo({ variant = "dark", className = "" }: BrandLogoProps) {
  const textColor = variant === "light" ? "text-background-50" : "text-foreground-950";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/logobg.png"
        alt=""
        aria-hidden="true"
        className="h-9 w-9 shrink-0 rounded-full object-cover"
      />
      <span className={`font-heading text-[22px] font-semibold leading-none tracking-tight ${textColor}`}>
        Heramio
      </span>
    </div>
  );
}