import { Link } from "react-router-dom";
import TopBar from "@/components/feature/TopBar";
import NearbyStrip from "@/components/feature/NearbyStrip";
import PostCard from "@/components/feature/PostCard";
import { useAppData } from "@/store/AppDataProvider";

const quickActions = [
  { to: "/nearby", icon: "ri-map-pin-2-line", label: "Nearby", hint: "Who's close" },
  { to: "/events", icon: "ri-calendar-event-line", label: "Events", hint: "Meet tonight" },
  { to: "/stays", icon: "ri-hotel-line", label: "Stays", hint: "Hotels & villas" },
];

export default function Home() {
  const { posts, loading, error, refresh } = useAppData();

  return (
    <>
      <TopBar />

      <div className="mx-auto w-full max-w-[600px] lg:border-x lg:border-background-200/70">
        <div className="px-4 pt-3">
          <Link
            to="/search"
            className="flex items-center gap-2 rounded-full border border-background-200 bg-background-100 px-4 py-2.5 text-sm text-foreground-500 transition-colors hover:bg-background-200/70"
          >
            <i className="ri-search-line text-lg" />
            Search people by gender, country &amp; estate
          </Link>
        </div>

        <NearbyStrip />

        <div className="grid grid-cols-3 gap-2 border-b border-background-200/70 px-4 py-3">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-background-200/80 bg-background-50 py-3 transition-colors hover:bg-background-100"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                <i className={`${action.icon} text-lg`} />
              </span>
              <span className="text-xs font-semibold text-foreground-950">{action.label}</span>
              <span className="-mt-1 text-[10px] text-foreground-500">{action.hint}</span>
            </Link>
          ))}
        </div>

        {error ? (
          <div className="mx-4 mt-4 flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2.5 text-xs text-primary-800">
            <i className="ri-error-warning-line" />
            <span className="flex-1">{error}</span>
            <button type="button" onClick={() => refresh()} className="font-semibold underline">
              Retry
            </button>
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-xs text-foreground-500">
            <i className="ri-loader-4-line animate-spin text-base text-primary-500" />
            Loading your feed
          </div>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} />)
        )}

        <p className="py-10 text-center text-xs text-foreground-400">
          You're all caught up · Heramio
        </p>
      </div>
    </>
  );
}