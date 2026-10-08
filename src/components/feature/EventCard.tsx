import type { AppEvent } from "@/lib/types";

interface EventCardProps {
  event: AppEvent;
  onJoin: (event: AppEvent) => void;
  joined: boolean;
}

export default function EventCard({ event, onJoin, joined }: EventCardProps) {
  const spotsLeft = event.capacity - event.attendees;
  const fill = Math.round((event.attendees / event.capacity) * 100);

  return (
    <article className="overflow-hidden rounded-2xl border border-background-200/80 bg-background-50">
      <div className="relative h-44 w-full overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          title={`${event.title} — ${event.category} at ${event.venueName}`}
          className="h-full w-full object-cover object-top"
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-background-50/90 px-2.5 py-1 text-[11px] font-semibold text-foreground-900 backdrop-blur">
          <i className="ri-price-tag-3-line text-accent-700" />
          {event.category}
        </span>
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-foreground-950/80 px-2.5 py-1 text-[11px] font-semibold text-background-50 backdrop-blur">
          {event.price === 0 ? "Free" : `$${event.price}`}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary-700">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-1">
            <i className="ri-calendar-event-line" />
            {event.date}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-background-100 px-2.5 py-1 text-foreground-700">
            <i className="ri-time-line" />
            {event.time}
          </span>
        </div>

        <h3 className="mt-2.5 font-heading text-lg font-semibold text-foreground-950">{event.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-foreground-700">{event.description}</p>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-foreground-600">
          <i className="ri-shield-check-fill text-primary-500" />
          <span className="font-medium text-foreground-800">{event.venueName}</span>
          <span className="text-foreground-400">·</span>
          <span>{event.estate}, {event.city}</span>
        </div>

        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-background-200">
            <div className="h-full rounded-full bg-accent-500" style={{ width: `${fill}%` }} />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-foreground-500">
            <span>{event.attendees} going</span>
            <span>{spotsLeft} spots left</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onJoin(event)}
          disabled={joined}
          className={`mt-3.5 flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${
            joined
              ? "bg-secondary-100 text-secondary-900"
              : "bg-primary-500 text-background-50 hover:bg-primary-600"
          }`}
        >
          <i className={joined ? "ri-check-line" : "ri-add-line"} />
          {joined ? "You're going" : "Join event"}
        </button>
      </div>
    </article>
  );
}