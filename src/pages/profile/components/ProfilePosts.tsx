import { useState } from "react";
import { useAppData } from "@/store/AppDataProvider";

const tabs = [
  { key: "posts", label: "Posts", icon: "ri-grid-fill" },
  { key: "saved", label: "Saved", icon: "ri-bookmark-fill" },
];

export default function ProfilePosts() {
  const { posts, meId, savedPostIds } = useAppData();
  const [tab, setTab] = useState("posts");

  const list =
    tab === "posts"
      ? posts.filter((post) => post.authorId === meId)
      : posts.filter((post) => savedPostIds.includes(post.id));

  return (
    <section>
      <div className="flex border-y border-background-200/70">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap py-3 text-xs font-semibold uppercase tracking-wide transition-colors ${
              tab === item.key
                ? "border-t-2 border-foreground-950 text-foreground-950"
                : "border-t-2 border-transparent text-foreground-500"
            }`}
          >
            <i className={`${item.icon} text-base`} />
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
          <i
            className={`${
              tab === "posts" ? "ri-camera-line" : "ri-bookmark-line"
            } text-4xl text-foreground-400`}
          />
          <p className="text-sm text-foreground-600">
            {tab === "posts"
              ? "You haven't posted yet. Share your first moment."
              : "No saved posts yet. Tap the bookmark on any post to keep it here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1 p-1">
          {list.map((post) => (
            <div key={post.id} className="group relative aspect-square overflow-hidden rounded-sm">
              <img
                src={post.image}
                alt={post.caption || "Post"}
                title={post.caption}
                className="h-full w-full object-cover object-top"
              />
              <span className="absolute inset-0 flex items-center justify-center gap-3 bg-foreground-950/0 opacity-0 transition-all group-hover:bg-foreground-950/40 group-hover:opacity-100">
                <span className="flex items-center gap-1 text-xs font-semibold text-background-50">
                  <i className="ri-heart-3-fill" />
                  {post.likes}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-background-50">
                  <i className="ri-chat-1-fill" />
                  {post.comments}
                </span>
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}