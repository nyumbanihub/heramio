import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useAppData } from "@/store/AppDataProvider";

const emojis = ["😊", "😂", "❤️", "🔥", "🙌", "😍", "👍", "🎉", "😅", "🥂"];

export default function Chat() {
  const { id = "" } = useParams();
  const { getConversation, getUser, messagesFor, sendMessage, meId, loading } = useAppData();

  const conversation = getConversation(id);
  const user = conversation ? getUser(conversation.userId) : undefined;
  const messages = conversation ? messagesFor(conversation.id) : [];

  const [draft, setDraft] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showSafety, setShowSafety] = useState(false);
  const [toast, setToast] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  };

  const send = async (e: FormEvent) => {
    e.preventDefault();
    const value = draft.trim();
    if (!value || !conversation) return;
    setDraft("");
    setShowEmoji(false);
    await sendMessage(conversation.id, value);
  };

  if (!conversation) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-24 text-center">
        <i
          className={`${loading ? "ri-loader-4-line animate-spin" : "ri-chat-3-line"} text-4xl text-foreground-400`}
        />
        <p className="text-sm text-foreground-600">
          {loading ? "Loading conversation" : "We couldn't find that conversation."}
        </p>
      </div>
    );
  }

  const partnerName = user?.name ?? "Member";

  return (
    <>
      <div className="sticky top-14 z-30 border-b border-background-200/80 bg-background-50/95 backdrop-blur-md lg:top-0">
        <div className="mx-auto flex max-w-[600px] items-center gap-3 px-3 py-2.5">
          <Link
            to="/messages"
            aria-label="Back"
            className="flex h-9 w-9 shrink-0 items-center justify-center text-foreground-900"
          >
            <i className="ri-arrow-left-line text-2xl" />
          </Link>
          <Link to={`/u/${conversation.userId}`} className="flex min-w-0 flex-1 items-center gap-3">
            <span className="relative shrink-0">
              <img
                src={user?.avatar}
                alt={partnerName}
                className="h-10 w-10 rounded-full object-cover object-top"
              />
              {conversation.online ? (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background-50 bg-secondary-500" />
              ) : null}
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-1 text-sm font-semibold text-foreground-950">
                <span className="truncate">{partnerName}</span>
                {user?.verified ? <i className="ri-verified-badge-fill text-primary-500" /> : null}
              </span>
              <span className="block text-xs text-foreground-500">
                {conversation.online ? "Active now" : "Active recently"}
              </span>
            </span>
          </Link>

          <button
            type="button"
            aria-label="Video call"
            onClick={() => flash("Starting secure video call")}
            className="flex h-9 w-9 items-center justify-center text-foreground-800"
          >
            <i className="ri-vidicon-line text-2xl" />
          </button>

          <div className="relative">
            <button
              type="button"
              aria-label="Safety menu"
              onClick={() => setShowSafety((v) => !v)}
              className="flex h-9 w-9 items-center justify-center text-foreground-800"
            >
              <i className="ri-shield-line text-2xl" />
            </button>
            {showSafety ? (
              <div className="absolute right-0 top-11 z-30 w-52 overflow-hidden rounded-lg border border-background-200 bg-background-50 py-1">
                {["Safety tips", "Report user", "Block user", "View profile", "End conversation"].map(
                  (option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setShowSafety(false);
                        flash(option);
                      }}
                      className="block w-full px-4 py-2.5 text-left text-sm text-foreground-800 hover:bg-background-100"
                    >
                      {option}
                    </button>
                  ),
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[600px] px-4 py-4 lg:border-x lg:border-background-200/70">
        <div className="flex flex-col gap-2.5">
          {messages.map((message) => {
            const mine = message.senderId === meId;
            return (
              <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[76%] ${mine ? "items-end" : "items-start"} flex flex-col`}>
                  {message.image ? (
                    <div className="w-56 overflow-hidden rounded-2xl border border-background-200/70">
                      <img
                        src={message.image}
                        alt="Shared"
                        className="h-full w-full object-cover object-top"
                      />
                    </div>
                  ) : null}
                  {message.text ? (
                    <p
                      className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        mine
                          ? "bg-primary-500 text-background-50"
                          : "bg-background-100 text-foreground-900"
                      }`}
                    >
                      {message.text}
                    </p>
                  ) : null}
                  <span className="mt-1 flex items-center gap-1 text-[10px] text-foreground-500">
                    {message.time}
                    {mine ? <i className="ri-check-double-line text-primary-500" /> : null}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div ref={bottomRef} />
      </div>

      {showEmoji ? (
        <div className="sticky bottom-[130px] z-30 mx-auto max-w-[600px] px-4 lg:bottom-[70px]">
          <div className="flex w-fit flex-wrap gap-3 rounded-2xl border border-background-200 bg-background-50 px-4 py-3">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setDraft((d) => d + emoji)}
                className="text-2xl transition-transform hover:scale-110"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <form
        onSubmit={send}
        className="sticky bottom-16 z-30 border-t border-background-200/80 bg-background-50/95 backdrop-blur-md lg:bottom-0"
      >
        <div className="mx-auto flex max-w-[600px] items-center gap-2 px-3 py-2.5">
          <button
            type="button"
            aria-label="Emoji"
            onClick={() => setShowEmoji((v) => !v)}
            className="flex h-9 w-9 shrink-0 items-center justify-center text-foreground-800"
          >
            <i className="ri-emotion-happy-line text-2xl" />
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Message..."
            className="flex-1 rounded-full bg-background-100 px-4 py-2.5 text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label="Send"
            className="flex h-9 w-9 shrink-0 items-center justify-center text-primary-600 disabled:opacity-40"
          >
            <i className="ri-send-plane-fill text-2xl" />
          </button>
        </div>
      </form>

      {toast ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-36 z-50 flex justify-center px-4">
          <span className="rounded-full bg-foreground-950 px-4 py-2 text-xs font-medium text-background-50">
            {toast}
          </span>
        </div>
      ) : null}
    </>
  );
}