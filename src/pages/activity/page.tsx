import { useState } from "react";
import { Link } from "react-router-dom";
import TopBar from "@/components/feature/TopBar";
import { useAppData } from "@/store/AppDataProvider";

const tabs = [
  { key: "activity", label: "Activity" },
  { key: "likes", label: "Likes" },
  { key: "views", label: "Views" },
];

export default function Activity() {
  const { activityItems, likesYou, profileViewers, getUser, isFollowing, toggleFollow } = useAppData();
  const [tab, setTab] = useState("activity");

  return (
    <>
      <TopBar title="Activity" />

      <div className="mx-auto w-full max-w-[600px] lg:border-x lg:border-background-200/70">
        <div className="border-b border-background-200/70 px-4 py-3">
          <div className="flex rounded-full bg-background-200/70 px-1 py-1">
            {tabs.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`flex-1 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                  tab === item.key
                    ? "bg-background-50 text-foreground-950 shadow-none"
                    : "text-foreground-600"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {tab === "activity" ? (
          <ul>
            {activityItems.map((item) => {
              const user = getUser(item.userId);
              if (!user) return null;
              const iconMap: Record<string, string> = {
                like: "ri-heart-3-fill text-primary-500",
                view: "ri-eye-fill text-accent-600",
                comment: "ri-chat-1-fill text-secondary-600",
                follow: "ri-user-add-fill text-primary-500",
              };
              return (
                <li key={item.id} className="flex items-center gap-3 border-b border-background-200/60 px-4 py-3">
                  <Link to={`/u/${user.id}`} className="relative shrink-0">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-12 w-12 rounded-full object-cover object-top"
                    />
                    <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background-50 bg-background-50">
                      <i className={`${iconMap[item.type]} text-sm leading-none`} />
                    </span>
                  </Link>
                  <p className="min-w-0 flex-1 text-sm text-foreground-800">
                    <Link to={`/u/${user.id}`} className="font-semibold text-foreground-950">
                      {user.username}
                    </Link>{" "}
                    {item.text}
                    <span className="ml-1.5 text-xs text-foreground-500">{item.time}</span>
                  </p>
                  {item.thumb ? (
                    <img
                      src={item.thumb}
                      alt="Post"
                      className="h-11 w-11 shrink-0 rounded-md object-cover object-top"
                    />
                  ) : item.type === "follow" ? (
                    <button
                      type="button"
                      onClick={() => toggleFollow(user.id)}
                      className={`shrink-0 whitespace-nowrap rounded-md px-4 py-1.5 text-xs font-semibold ${
                        isFollowing(user.id)
                          ? "border border-background-300 text-foreground-800"
                          : "bg-primary-500 text-background-50"
                      }`}
                    >
                      {isFollowing(user.id) ? "Following" : "Follow"}
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}

        {tab === "likes" ? (
          <div className="p-3">
            <p className="px-1 pb-3 text-sm text-foreground-600">
              People who liked your profile — connect back to start chatting.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {likesYou.map((item) => {
                const user = getUser(item.userId);
                if (!user) return null;
                return (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-xl border border-background-200/80 bg-background-100/40"
                  >
                    <Link to={`/u/${user.id}`} className="block h-44 w-full overflow-hidden">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-full w-full object-cover object-top"
                      />
                    </Link>
                    <div className="p-3">
                      <p className="flex items-center gap-1 text-sm font-semibold text-foreground-950">
                        {user.name}
                        {user.verified ? <i className="ri-verified-badge-fill text-primary-500" /> : null}
                      </p>
                      <p className="mt-0.5 text-xs text-foreground-500">
                        {user.city} · {item.time}
                      </p>
                      <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-accent-100 px-2.5 py-1 text-[11px] font-medium text-accent-800">
                        <i className="ri-sparkling-2-fill" />
                        {item.matchup}% match
                      </span>
                      <div className="mt-3 flex gap-2">
                        <Link
                          to={`/u/${user.id}`}
                          className="flex flex-1 items-center justify-center whitespace-nowrap rounded-md bg-primary-500 px-2 py-2 text-xs font-semibold text-background-50"
                        >
                          Connect
                        </Link>
                        <Link
                          to="/messages"
                          aria-label="Message"
                          className="flex h-8 w-8 items-center justify-center rounded-md border border-background-300 text-foreground-700"
                        >
                          <i className="ri-chat-3-line" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {tab === "views" ? (
          <div className="p-3">
            <p className="px-1 pb-3 text-sm text-foreground-600">
              {profileViewers.length} people viewed your profile recently.
            </p>
            <ul className="space-y-1">
              {profileViewers.map((item) => {
                const user = getUser(item.userId);
                if (!user) return null;
                return (
                  <li key={item.id} className="flex items-center gap-3 rounded-lg px-1 py-2.5">
                    <Link to={`/u/${user.id}`} className="shrink-0">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-12 w-12 rounded-full object-cover object-top"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1 text-sm font-semibold text-foreground-950">
                        {user.name}
                        {user.verified ? <i className="ri-verified-badge-fill text-primary-500" /> : null}
                      </p>
                      <p className="truncate text-xs text-foreground-500">
                        {user.city}, {user.country}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-foreground-500">{item.time}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </>
  );
}