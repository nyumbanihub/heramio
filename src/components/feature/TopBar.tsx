import { Link, NavLink } from "react-router-dom";
import BrandLogo from "@/components/feature/BrandLogo";

interface TopBarProps {
  title?: string;
  badge?: number;
}

export default function TopBar({ title, badge = 6 }: TopBarProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-background-200/80 bg-background-50/95 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex h-14 max-w-[600px] items-center justify-between px-4">
        {title ? (
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground-950">
            {title}
          </h1>
        ) : (
          <Link to="/" aria-label="Heramio home" className="flex items-center">
            <BrandLogo />
          </Link>
        )}

        <div className="flex items-center gap-4">
          <NavLink
            to="/search"
            aria-label="Search people"
            className="flex h-8 w-8 items-center justify-center text-foreground-800"
          >
            <i className="ri-search-line text-2xl leading-none" />
          </NavLink>
          <NavLink
            to="/create"
            aria-label="Create post"
            className="flex h-8 w-8 items-center justify-center text-foreground-800"
          >
            <i className="ri-add-line text-2xl leading-none" />
          </NavLink>
          <NavLink
            to="/activity"
            aria-label="Activity"
            className="relative flex h-8 w-8 items-center justify-center text-foreground-800"
          >
            <i className="ri-heart-3-line text-2xl leading-none" />
            {badge > 0 ? (
              <span className="absolute -right-1 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-500 px-1 text-[9px] font-semibold text-background-50">
                {badge}
              </span>
            ) : null}
          </NavLink>
        </div>
      </div>
    </header>
  );
}