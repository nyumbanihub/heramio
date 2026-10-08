import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import BrandLogo from "@/components/feature/BrandLogo";
import { authMemberAvatars } from "@/lib/content";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

const trustPoints = [
  { icon: "ri-shield-user-line", label: "Selfie-verified members only" },
  { icon: "ri-hotel-line", label: "Meetups at trusted hotels" },
  { icon: "ri-lock-2-line", label: "Encrypted, private by default" },
];

const stats = [
  { value: "12k+", label: "Verified members" },
  { value: "38", label: "Cities" },
  { value: "4.9", label: "Avg. rating" },
];

export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background-50 lg:grid lg:grid-cols-[1.05fr_minmax(440px,0.95fr)]">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-primary-100 via-background-100 to-accent-100 p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="animate-blob absolute -left-16 top-10 h-72 w-72 rounded-full bg-primary-300/40 blur-3xl" />
          <span className="animate-blob d3 absolute right-0 top-1/3 h-80 w-80 rounded-full bg-accent-300/40 blur-3xl" />
          <span className="animate-blob d5 absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-secondary-300/30 blur-3xl" />
        </div>

        <div className="relative">
          <BrandLogo />
        </div>

        <div className="relative max-w-md">
          <span className="reveal inline-flex items-center gap-2 rounded-full border border-background-50/70 bg-background-50/60 px-3 py-1.5 text-xs font-semibold text-primary-700 backdrop-blur">
            <i className="ri-verified-badge-fill" />
            Verified, real-world dating
          </span>

          <h2 className="reveal d2 mt-5 font-heading text-4xl font-semibold leading-tight tracking-tight text-foreground-950 xl:text-5xl">
            Meet real people,
            <br />
            <span className="text-primary-600">safely</span>.
          </h2>

          <p className="reveal d3 mt-4 text-sm leading-relaxed text-foreground-700">
            Heramio connects verified adults nearby. Every meetup happens at a trusted hotel, and every
            profile is backed by a real selfie.
          </p>

          <div className="reveal d4 mt-7 flex items-center gap-3">
            <div className="flex -space-x-3">
              {authMemberAvatars.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt="Heramio member"
                  className="h-11 w-11 rounded-full border-2 border-background-50 object-cover object-top"
                />
              ))}
            </div>
            <span className="text-xs text-foreground-700">
              <strong className="text-foreground-950">12,000+</strong> members online today
            </span>
          </div>

          <ul className="reveal d5 mt-8 space-y-3">
            {trustPoints.map((point) => (
              <li key={point.label} className="flex items-center gap-3 text-sm text-foreground-800">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background-50 text-primary-600">
                  <i className={`${point.icon} text-base`} />
                </span>
                {point.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="reveal d6 relative flex flex-wrap gap-x-10 gap-y-3">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-heading text-2xl font-semibold text-foreground-950">{stat.value}</p>
              <p className="text-xs text-foreground-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </aside>

      <main className="relative flex min-h-screen flex-col justify-center px-4 py-10 sm:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 overflow-hidden lg:hidden">
          <span className="animate-blob absolute -left-10 -top-10 h-52 w-52 rounded-full bg-primary-200/50 blur-3xl" />
          <span className="animate-blob d3 absolute right-0 top-0 h-52 w-52 rounded-full bg-accent-200/50 blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-[430px]">
          <div className="mb-6 flex justify-center lg:hidden">
            <Link to="/auth/login" aria-label="Heramio" className="cursor-pointer">
              <BrandLogo />
            </Link>
          </div>

          <div className="reveal rounded-2xl border border-background-200/80 bg-background-50/95 p-6 backdrop-blur-sm md:p-8">
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground-950">
              {title}
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground-600">{subtitle}</p>
            <div className="mt-6">{children}</div>
          </div>

          <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-foreground-500">
            <i className="ri-shield-check-line text-sm text-secondary-600" />
            Verified members · Protected meetups · 18+
          </p>
        </div>
      </main>
    </div>
  );
}