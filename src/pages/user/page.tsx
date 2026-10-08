import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BookingSheet from "@/components/feature/BookingSheet";
import { useAppData } from "@/store/AppDataProvider";
import { exploreItems, verificationBadges } from "@/lib/content";

const distanceLabel = (km: number): string => {
  if (km <= 0) return "Right here";
  if (km < 1) return `${Math.round(km * 1000)} m away`;
  if (km < 100) return `About ${km.toFixed(1)} km away`;
  return `${Math.round(km).toLocaleString()} km away`;
};

export default function UserProfile() {
  const { id = "" } = useParams();
  const { getUser, posts, isFollowing, toggleFollow, isProfileLiked, toggleProfileLike, viewProfile } = useAppData();
  const user = getUser(id);
  const [saved, setSaved] = useState(false);
  const [meetOpen, setMeetOpen] = useState(false);
  const [toast, setToast] = useState("");

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  };

  useEffect(() => {
    if (user?.id) viewProfile(user.id);
  }, [user?.id, viewProfile]);

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-24 text-center">
        <i className="ri-user-search-line text-4xl text-foreground-400" />
        <p className="text-sm text-foreground-600">We couldn't find that member.</p>
      </div>
    );
  }

  const theirPosts = posts.filter((p) => p.authorId === user.id);
  const gallery = (theirPosts.length > 0 ? theirPosts.map((p) => p.image) : exploreItems.map((p) => p.image)).slice(0, 9);

  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    `${user.estate}, ${user.city}`,
  )}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  const actions = [
    { icon: "ri-vidicon-line", label: "Video", onClick: () => flash("Video calling requires a verified connection") },
    { icon: "ri-shield-check-line", label: "Meet up", onClick: () => setMeetOpen(true) },
    { icon: "ri-flag-line", label: "Report", onClick: () => flash("Report submitted") },
  ];

  return (
    <>
      <div className="sticky top-14 z-30 border-b border-background-200/80 bg-background-50/95 backdrop-blur-md lg:top-0">
        <div className="mx-auto flex max-w-[936px] items-center gap-3 px-3 py-2.5">
          <Link to="/" aria-label="Back" className="flex h-9 w-9 items-center justify-center text-foreground-900">
            <i className="ri-arrow-left-line text-2xl" />
          </Link>
          <p className="flex items-center gap-1 text-sm font-semibold text-foreground-950">
            {user.username}
            {user.verified ? <i className="ri-verified-badge-fill text-primary-500" /> : null}
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[936px] px-4 py-5 lg:border-x lg:border-background-200/70">
        <div className="flex items-start gap-4">
          <span className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 p-[3px]">
            <img
              src={user.avatar}
              alt={user.name}
              title={user.name}
              className="h-full w-full rounded-full border-2 border-background-50 object-cover object-top"
            />
            {user.online ? (
              <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-background-50 bg-secondary-500" />
            ) : null}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="flex flex-wrap items-center gap-1.5 font-heading text-xl font-semibold text-foreground-950">
              {user.name}
              {user.verified ? <i className="ri-verified-badge-fill text-primary-500" /> : null}
            </h1>
            <p className="text-sm text-foreground-500">@{user.username}</p>
            <span
              className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                user.online ? "bg-secondary-100 text-secondary-800" : "bg-background-200 text-foreground-600"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${user.online ? "bg-secondary-500" : "bg-foreground-400"}`} />
              {user.online ? "Online now" : "Offline"}
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl border border-background-200/80 bg-background-100/50 py-3">
          <div className="text-center">
            <p className="font-heading text-lg font-semibold text-foreground-950">{user.followers}</p>
            <p className="text-xs text-foreground-500">Followers</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-lg font-semibold text-foreground-950">{user.following}</p>
            <p className="text-xs text-foreground-500">Following</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-lg font-semibold text-foreground-950">4.8</p>
            <p className="text-xs text-foreground-500">Rating</p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-foreground-800">{user.bio}</p>

        <div className="mt-4 overflow-hidden rounded-xl border border-background-200/80">
          <iframe title={`${user.name} location area`} src={mapSrc} className="h-40 w-full border-0" loading="lazy" />
          <div className="flex items-center justify-between gap-2 bg-background-50 px-4 py-3">
            <p className="flex items-center gap-1.5 text-sm font-medium text-foreground-900">
              <i className="ri-map-pin-2-fill text-primary-500" />
              {user.estate}, {user.city}
            </p>
            <span className="shrink-0 text-xs text-foreground-500">{distanceLabel(user.distanceKm)}</span>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-foreground-400">
          Area shown only — exact address is never shared. Meetups happen at verified hotels.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {verificationBadges.map((badge) => (
            <span
              key={badge.key}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                badge.done ? "bg-secondary-100 text-secondary-900" : "bg-background-200 text-foreground-600"
              }`}
            >
              <i className={badge.icon} />
              {badge.label}
            </span>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => toggleFollow(user.id)}
            className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-3 text-sm font-semibold transition-colors ${
              isFollowing(user.id)
                ? "border border-background-300 text-foreground-800"
                : "bg-foreground-950 text-background-50"
            }`}
          >
            <i className={isFollowing(user.id) ? "ri-user-follow-line" : "ri-user-add-line"} />
            {isFollowing(user.id) ? "Following" : "Follow"}
          </button>
          <button
            type="button"
            onClick={() => toggleProfileLike(user.id)}
            className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-3 text-sm font-semibold transition-colors ${
              isProfileLiked(user.id) ? "bg-primary-100 text-primary-700" : "bg-primary-500 text-background-50 hover:bg-primary-600"
            }`}
          >
            <i className={isProfileLiked(user.id) ? "ri-heart-3-fill" : "ri-heart-3-line"} />
            {isProfileLiked(user.id) ? "Liked" : "Like"}
          </button>
          <Link
            to="/messages"
            className="flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-background-300 px-4 py-3 text-sm font-semibold text-foreground-800"
          >
            <i className="ri-chat-3-line" />
            Chat
          </Link>
          <button
            type="button"
            aria-label="Save"
            onClick={() => setSaved((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-md border border-background-300 text-foreground-800"
          >
            <i className={saved ? "ri-bookmark-fill" : "ri-bookmark-line"} />
          </button>
        </div>

        <div className="mt-3 flex gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className="flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-background-100 px-3 py-2.5 text-xs font-medium text-foreground-700"
            >
              <i className={action.icon} />
              {action.label}
            </button>
          ))}
        </div>

        <Link
          to="/stays"
          className="mt-4 flex items-center gap-3 rounded-xl border border-primary-200 bg-primary-50 p-3.5"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
            <i className="ri-hotel-line text-xl" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-foreground-950">Stay near {user.estate}</span>
            <span className="block text-xs text-foreground-600">
              Browse hotels & Airbnb stays around {user.city}
            </span>
          </span>
          <i className="ri-arrow-right-s-line text-xl text-primary-600" />
        </Link>

        <div className="mt-6 grid grid-cols-3 gap-1">
          {gallery.map((src, index) => (
            <div key={`${user.id}-${index}`} className="aspect-square overflow-hidden rounded-sm">
              <img src={src} alt={`${user.username} moment ${index + 1}`} className="h-full w-full object-cover object-top" />
            </div>
          ))}
        </div>
      </div>

      <BookingSheet
        open={meetOpen}
        onClose={() => setMeetOpen(false)}
        mode="meetup"
        partnerName={user.name}
      />

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