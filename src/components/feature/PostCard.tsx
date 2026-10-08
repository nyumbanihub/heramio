import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import type { FeedPost } from "@/lib/types";
import { useAppData } from "@/store/AppDataProvider";
import { DEFAULT_AVATAR } from "@/lib/dataApi";
import BookingSheet from "@/components/feature/BookingSheet";

const distanceLabel = (km: number): string => {
  if (km <= 0) return "here";
  if (km < 1) return `${Math.round(km * 1000)} m away`;
  if (km < 100) return `${km.toFixed(1)} km away`;
  return `${Math.round(km).toLocaleString()} km away`;
};

interface PostCardProps {
  post: FeedPost;
}

export default function PostCard({ post }: PostCardProps) {
  const { getUser, me, commentsFor, toggleLike, addComment, isFollowing, toggleFollow, isSaved, toggleSave } = useAppData();
  const author = getUser(post.authorId);

  const [showMenu, setShowMenu] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [draft, setDraft] = useState("");
  const [toast, setToast] = useState("");
  const [meetOpen, setMeetOpen] = useState(false);

  if (!author) return null;

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  };

  const doubleTapLike = () => {
    if (!post.liked) toggleLike(post.id);
    setShowHeart(true);
    window.setTimeout(() => setShowHeart(false), 700);
  };

  const submitComment = (e: FormEvent) => {
    e.preventDefault();
    const value = draft.trim();
    if (!value) return;
    addComment(post.id, value);
    setDraft("");
  };

  const comments = commentsFor(post.id);
  const aspectClass = post.aspect === "portrait" ? "aspect-[4/5]" : "aspect-square";

  return (
    <article className="border-b border-background-200/70 bg-background-50 pb-3">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to={`/u/${author.id}`} className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 p-[2px]">
            <img
              src={author.avatar ?? DEFAULT_AVATAR}
              alt={author.name}
              className="h-full w-full rounded-full object-cover object-top"
            />
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-1 text-sm font-semibold text-foreground-950">
              <span className="truncate">{author.username}</span>
              {author.verified ? <i className="ri-verified-badge-fill text-primary-500" /> : null}
            </span>
            <span className="flex items-center gap-1 truncate text-xs text-foreground-500">
              <i className="ri-map-pin-2-line text-primary-500" />
              {author.estate} · {distanceLabel(author.distanceKm)} · {post.time}
            </span>
          </span>
        </Link>

        <div className="relative">
          <button
            type="button"
            aria-label="More options"
            onClick={() => setShowMenu((v) => !v)}
            className="flex h-8 w-8 items-center justify-center text-foreground-700"
          >
            <i className="ri-more-fill text-xl" />
          </button>
          {showMenu ? (
            <div className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-lg border border-background-200 bg-background-50 py-1">
              {["Report", "Block", "Copy link"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    flash(`${option} · done`);
                  }}
                  className="block w-full px-4 py-2.5 text-left text-sm text-foreground-800 hover:bg-background-100"
                >
                  {option}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  toggleFollow(author.id);
                  flash(isFollowing(author.id) ? "Unfollowed" : "Following");
                }}
                className="block w-full px-4 py-2.5 text-left text-sm text-foreground-800 hover:bg-background-100"
              >
                {isFollowing(author.id) ? "Unfollow" : "Follow"}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className={`relative w-full overflow-hidden ${aspectClass}`} onDoubleClick={doubleTapLike}>
        <img
          src={post.image}
          alt={post.caption}
          title={post.caption}
          className="h-full w-full object-cover object-top"
        />
        {showHeart ? (
          <span className="absolute inset-0 flex items-center justify-center">
            <i className="ri-heart-3-fill text-7xl text-background-50 drop-shadow" />
          </span>
        ) : null}
      </div>

      <div className="flex items-center justify-between px-4 pt-3">
        <div className="flex items-center gap-4">
          <button type="button" aria-label="Like" onClick={() => toggleLike(post.id)} className="flex items-center">
            <i
              className={`${
                post.liked ? "ri-heart-3-fill text-primary-500" : "ri-heart-3-line text-foreground-900"
              } text-[26px] leading-none transition-transform active:scale-90`}
            />
          </button>
          <Link to="/messages" aria-label="Comment" className="flex items-center">
            <i className="ri-chat-1-line text-[25px] leading-none text-foreground-900" />
          </Link>
          <button
            type="button"
            aria-label="Share"
            onClick={() => flash("Link copied")}
            className="flex items-center"
          >
            <i className="ri-send-plane-line text-[25px] leading-none text-foreground-900" />
          </button>
        </div>
        <button
          type="button"
          aria-label="Save"
          onClick={() => toggleSave(post.id)}
          className="flex items-center"
        >
          <i
            className={`${
              isSaved(post.id) ? "ri-bookmark-fill text-foreground-900" : "ri-bookmark-line text-foreground-900"
            } text-[24px] leading-none`}
          />
        </button>
      </div>

      <div className="px-4 pt-2">
        <p className="text-sm font-semibold text-foreground-950">
          {post.likes.toLocaleString()} likes
        </p>
        <p className="mt-1 text-sm leading-relaxed text-foreground-800">
          <Link to={`/u/${author.id}`} className="mr-1.5 font-semibold text-foreground-950">
            {author.username}
          </Link>
          {post.caption}
        </p>

        {comments.length > 0 ? (
          <ul className="mt-1.5 space-y-1">
            {comments.map((comment) => (
              <li key={comment.id} className="text-sm text-foreground-800">
                <span className="mr-1.5 font-semibold text-foreground-950">
                  {getUser(comment.userId)?.username ?? "member"}
                </span>
                {comment.body}
              </li>
            ))}
          </ul>
        ) : null}

        {post.comments > comments.length ? (
          <Link to="/messages" className="mt-1.5 block text-sm text-foreground-500">
            View all {post.comments} comments
          </Link>
        ) : null}

        <div className="mt-3 flex gap-2">
          <Link
            to="/messages"
            className="flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-background-300 px-3 py-2.5 text-sm font-semibold text-foreground-800 transition-colors hover:bg-background-100"
          >
            <i className="ri-chat-smile-2-line" />
            Say hi
          </Link>
          <button
            type="button"
            onClick={() => setMeetOpen(true)}
            className="flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-3 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            <i className="ri-shield-check-line" />
            Meet up
          </button>
        </div>

        <form onSubmit={submitComment} className="mt-3 flex items-center gap-2 border-t border-background-200/70 pt-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 p-[1.5px]">
            <img
              src={me?.avatar ?? DEFAULT_AVATAR}
              alt={me?.name ?? "You"}
              className="h-full w-full rounded-full object-cover object-top"
            />
          </span>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-transparent text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="whitespace-nowrap text-sm font-semibold text-primary-600 disabled:opacity-40"
          >
            Post
          </button>
        </form>
      </div>

      {toast ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4">
          <span className="rounded-full bg-foreground-950 px-4 py-2 text-xs font-medium text-background-50">
            {toast}
          </span>
        </div>
      ) : null}

      <BookingSheet
        open={meetOpen}
        onClose={() => setMeetOpen(false)}
        mode="meetup"
        partnerName={author.name}
      />
    </article>
  );
}