import { NavLink } from "react-router-dom";
import { useAppData } from "@/store/AppDataProvider";
import { DEFAULT_AVATAR } from "@/lib/dataApi";

interface NavItem {
  to: string;
  label: string;
  icon: string;
  activeIcon: string;
  end: boolean;
  badge?: number;
  isAvatar?: boolean;
}

const items: NavItem[] = [
  { to: "/", label: "Home", icon: "ri-home-5-line", activeIcon: "ri-home-5-fill", end: true },
  { to: "/nearby", label: "Nearby", icon: "ri-map-pin-2-line", activeIcon: "ri-map-pin-2-fill", end: false },
  { to: "/events", label: "Events", icon: "ri-calendar-event-line", activeIcon: "ri-calendar-event-fill", end: false },
  { to: "/messages", label: "Chat", icon: "ri-chat-3-line", activeIcon: "ri-chat-3-fill", end: false },
  { to: "/profile", label: "Profile", icon: "", activeIcon: "", end: false, isAvatar: true },
];

export default function BottomNav() {
  const { me, conversations } = useAppData();
  const unread = conversations.reduce((n, c) => n + c.unread, 0);
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-background-200/80 bg-background-50/95 backdrop-blur-md lg:hidden">
      <ul className="mx-auto flex h-16 max-w-[600px] items-stretch">
        {items.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              end={item.end}
              className="group relative flex h-full flex-col items-center justify-center gap-1"
              aria-label={item.label}
            >
              {({ isActive }) => (
                <>
                  {item.isAvatar ? (
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full p-[1.5px] ${
                        isActive ? "bg-primary-500" : "bg-background-300"
                      }`}
                    >
                      <img
                        src={me?.avatar ?? DEFAULT_AVATAR}
                        alt={me?.name ?? "Your profile"}
                        className="h-full w-full rounded-full object-cover object-top"
                      />
                    </span>
                  ) : (
                    <i
                      className={`${
                        isActive ? item.activeIcon : item.icon
                      } text-[24px] leading-none ${isActive ? "text-foreground-950" : "text-foreground-500"}`}
                    />
                  )}
                  {item.to === "/messages" && unread ? (
                    <span className="absolute right-[22%] top-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-500 px-1 text-[9px] font-semibold text-background-50">
                      {unread}
                    </span>
                  ) : null}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}