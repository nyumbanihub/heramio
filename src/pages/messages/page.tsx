import { useState } from "react";
import { Link } from "react-router-dom";
import TopBar from "@/components/feature/TopBar";
import { useAppData } from "@/store/AppDataProvider";

export default function Messages() {
  const { conversations, getUser } = useAppData();
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");

  const filtered = conversations.filter((c) => {
    const user = getUser(c.userId);
    if (!user) return false;
    return (
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.username.toLowerCase().includes(query.toLowerCase())
    );
  });

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  };

  return (
    <>
      <TopBar title="Messages" badge={0} />

      <div className="mx-auto w-full max-w-[600px] lg:border-x lg:border-background-200/70">
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="flex flex-1 items-center gap-2 rounded-lg bg-background-100 px-3 py-2.5">
            <i className="ri-search-line text-lg text-foreground-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search messages"
              className="w-full bg-transparent text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none"
            />
          </div>
          <button
            type="button"
            aria-label="New message"
            onClick={() => flash("New message")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-background-200 text-foreground-800"
          >
            <i className="ri-edit-line text-lg" />
          </button>
        </div>

        <ul>
          {filtered.map((conversation) => {
            const user = getUser(conversation.userId);
            if (!user) return null;
            return (
              <li key={conversation.id}>
                <Link
                  to={`/messages/${conversation.id}`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-background-100/60"
                >
                  <span className="relative shrink-0">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-14 w-14 rounded-full object-cover object-top"
                    />
                    {conversation.online ? (
                      <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background-50 bg-secondary-500" />
                    ) : null}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 text-sm font-semibold text-foreground-950">
                      <span className="truncate">{user.name}</span>
                      {user.verified ? (
                        <i className="ri-verified-badge-fill text-primary-500" />
                      ) : null}
                    </p>
                    <p
                      className={`truncate text-sm ${
                        conversation.unread > 0
                          ? "font-medium text-foreground-900"
                          : "text-foreground-500"
                      }`}
                    >
                      {conversation.lastMessage}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="text-xs text-foreground-500">{conversation.time}</span>
                    {conversation.unread > 0 ? (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-500 px-1.5 text-[11px] font-semibold text-background-50">
                        {conversation.unread}
                      </span>
                    ) : null}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-24 text-center">
            <i className="ri-chat-3-line text-4xl text-foreground-400" />
            <p className="text-sm text-foreground-600">No conversations found.</p>
          </div>
        ) : null}
      </div>

      {toast ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4">
          <span className="rounded-full bg-foreground-950 px-4 py-2 text-xs font-medium text-background-50">
            {toast}
          </span>
        </div>
      ) : null}
    </>
  );
}