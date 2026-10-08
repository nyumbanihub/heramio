import { NavLink } from "react-router-dom";
import BrandLogo from "@/components/feature/BrandLogo";
import { useAppData } from "@/store/AppDataProvider";
import { DEFAULT_AVATAR } from "@/lib/dataApi";

const baseItems = [
  { to: "/", label: "Home", icon: "ri-home-5-line", activeIcon: "ri-home-5-fill", end: true },
  { to: "/search", label: "Search", icon: "ri-search-line", activeIcon: "ri-search-line", end: false },
  { to: "/nearby", label: "Nearby", icon: "ri-map-pin-2-line", activeIcon: "ri-map-pin-2-fill", end: false },
  { to: "/events", label: "Events", icon: "ri-calendar-event-line", activeIcon: "ri-calendar-event-fill", end: false },
  { to: "/stays", label: "Hotels & stays", icon: "ri-hotel-line", activeIcon: "ri-hotel-fill", end: false },
  { to: "/trips", label: "My trips", icon: "ri-suitcase-line", activeIcon: "ri-suitcase-fill", end: false },
  { to: "/create", label: "Create", icon: "ri-add-box-line", activeIcon: "ri-add-box-fill", end: false },
  { to: "/messages", label: "Messages", icon: "ri-chat-3-line", activeIcon: "ri-chat-3-fill", end: false },
  { to: "/activity", label: "Activity", icon: "ri-heart-3-line", activeIcon: "ri-heart-3-fill", end: false },
  { to: "/profile", label: "Profile", icon: "ri-user-3-line", activeIcon: "ri-user-3-fill", end: false },
  { to: "/settings", label: "Settings", icon: "ri-settings-3-line", activeIcon: "ri-settings-3-fill", end: false },
];

const hostItem = {
  to: "/host",
  label: "Host dashboard",
  icon: "ri-store-3-line",
  activeIcon: "ri-store-3-fill",
  end: false,
};

export default function DesktopRail() {
  const { me, role } = useAppData();
  const items = [...baseItems];
  if (role === "host") items.splice(6, 0, hostItem);
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-background-200/80 bg-background-50 px-3 py-6 lg:flex lg:w-[76px] xl:w-[248px] xl:px-4">
      <div className="flex h-10 items-center justify-center xl:justify-start xl:px-2">
        <span className="xl:hidden">
          <i className="ri-heart-3-fill text-2xl text-primary-500" />
        </span>
        <span className="hidden xl:block">
          <BrandLogo />
        </span>
      </div>

      <nav className="mt-8 flex-1">
        <ul className="flex flex-col gap-1">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                aria-label={item.label}
                className={({ isActive }) =>
                  `flex items-center gap-4 rounded-lg px-3 py-3 transition-colors hover:bg-background-100 xl:px-3 ${
                    isActive ? "text-foreground-950" : "text-foreground-700"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <i
                      className={`${isActive ? item.activeIcon : item.icon} text-[26px] leading-none`}
                    />
                    <span
                      className={`hidden text-[15px] xl:block ${isActive ? "font-semibold" : "font-normal"}`}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <NavLink
        to="/profile"
        className="flex items-center gap-4 rounded-lg px-3 py-3 transition-colors hover:bg-background-100 xl:px-3"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 p-[1.5px]">
          <img
            src={me?.avatar ?? DEFAULT_AVATAR}
            alt={me?.name ?? "Your profile"}
            className="h-full w-full rounded-full object-cover object-top"
          />
        </span>
        <span className="hidden min-w-0 xl:block">
          <span className="block truncate text-sm font-semibold text-foreground-950">{me?.name ?? "Your profile"}</span>
          <span className="block truncate text-xs text-foreground-500">@{me?.username ?? "you"}</span>
        </span>
      </NavLink>
    </aside>
  );
}