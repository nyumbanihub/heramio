import { useState } from "react";
import TopBar from "@/components/feature/TopBar";
import EventCard from "@/components/feature/EventCard";
import { useAppData } from "@/store/AppDataProvider";
import type { AppEvent } from "@/lib/types";

const categories = ["All", "Mixer", "Live Music", "Outdoors", "Arts", "Poolside", "Dance"];

export default function Events() {
  const { events, attending, toggleAttend } = useAppData();
  const [category, setCategory] = useState("All");
  const [toast, setToast] = useState("");
  const [activeEvent, setActiveEvent] = useState<AppEvent | null>(null);

  const filtered = events.filter((e) => category === "All" || e.category === category);

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const handleJoin = async (event: AppEvent) => {
    if (!attending.includes(event.id)) {
      await toggleAttend(event.id);
    }
    setActiveEvent(event);
  };

  return (
    <>
      <TopBar title="Events" />

      <div className="mx-auto w-full max-w-[936px] lg:border-x lg:border-background-200/70">
        <div className="border-b border-background-200/70 bg-gradient-to-br from-primary-50 to-accent-50 px-4 py-5">
          <h1 className="font-heading text-xl font-semibold text-foreground-950">
            Places to meet, face to face
          </h1>
          <p className="mt-1 max-w-xl text-sm text-foreground-700">
            Curated mixers, live music and social evenings hosted only at Heramio-verified hotels. Easier than a
            one-to-one first date — come, mingle, stay as long as you like.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background-50/80 px-3 py-1.5 text-xs font-medium text-foreground-800">
              <i className="ri-shield-check-fill text-primary-500" />
              Verified venues only
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background-50/80 px-3 py-1.5 text-xs font-medium text-foreground-800">
              <i className="ri-group-line text-secondary-600" />
              Group setting, low pressure
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background-50/80 px-3 py-1.5 text-xs font-medium text-foreground-800">
              <i className="ri-price-tag-3-line text-accent-700" />
              Members get member pricing
            </span>
          </div>
        </div>

        <div className="px-4 py-3">
          <ul className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                    category === item
                      ? "bg-foreground-950 text-background-50"
                      : "bg-background-200/70 text-foreground-700"
                  }`}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-1 gap-4 px-4 pb-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              joined={attending.includes(event.id)}
              onJoin={handleJoin}
            />
          ))}
        </div>
      </div>

      {activeEvent ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-foreground-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-background-50">
            <div className="h-32 w-full overflow-hidden">
              <img src={activeEvent.image} alt={activeEvent.title} className="h-full w-full object-cover object-top" />
            </div>
            <div className="p-5 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary-100 text-secondary-700">
                <i className="ri-checkbox-circle-fill text-3xl" />
              </span>
              <h3 className="mt-3 font-heading text-lg font-semibold text-foreground-950">
                You're in!
              </h3>
              <p className="mt-1 text-sm text-foreground-600">
                {activeEvent.title} · {activeEvent.date} at {activeEvent.time}
              </p>
              <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-foreground-600">
                <i className="ri-shield-check-fill text-primary-500" />
                {activeEvent.venueName}, {activeEvent.estate} — a verified hotel
              </p>
              <button
                type="button"
                onClick={() => setActiveEvent(null)}
                className="mt-4 w-full whitespace-nowrap rounded-md bg-primary-500 px-4 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
              >
                Got it
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveEvent(null);
                  flash("Book a stay near the venue?");
                }}
                className="mt-2 w-full whitespace-nowrap rounded-md border border-background-300 px-4 py-2.5 text-sm font-semibold text-foreground-800"
              >
                Book a stay nearby
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[80] flex justify-center px-4">
          <span className="rounded-full bg-foreground-950 px-4 py-2 text-xs font-medium text-background-50">
            {toast}
          </span>
        </div>
      ) : null}
    </>
  );
}