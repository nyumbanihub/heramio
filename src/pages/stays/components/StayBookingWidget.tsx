import { useState } from "react";
import type { Venue } from "@/lib/types";

interface StayBookingWidgetProps {
  venue: Venue;
  onReserve: (checkIn: string, checkOut: string, guests: number) => void;
}

const isoDate = (date: Date): string => date.toISOString().slice(0, 10);
const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const fieldClass =
  "w-full rounded-lg border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200";

export default function StayBookingWidget({ venue, onReserve }: StayBookingWidgetProps) {
  const today = new Date();
  const [checkIn, setCheckIn] = useState(isoDate(today));
  const [checkOut, setCheckOut] = useState(isoDate(addDays(today, 2)));
  const [guests, setGuests] = useState(2);

  const nights = (() => {
    const diff = Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000);
    return diff > 0 ? diff : 1;
  })();

  const subtotal = nights * venue.pricePerNight;

  return (
    <div className="rounded-2xl border border-background-200/80 bg-background-50 p-4">
      <div className="flex items-baseline justify-between">
        <p className="font-heading text-2xl font-semibold text-foreground-950">
          KES {venue.pricePerNight.toLocaleString()}
        </p>
        <p className="text-xs text-foreground-500">per night</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-foreground-500">
            Check-in
          </span>
          <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={fieldClass} />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-foreground-500">
            Check-out
          </span>
          <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className={fieldClass} />
        </label>
      </div>

      <div className="mt-2">
        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-foreground-500">
          Guests
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Fewer guests"
            onClick={() => setGuests((g) => Math.max(1, g - 1))}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-background-300 text-foreground-700 hover:bg-background-100"
          >
            <i className="ri-subtract-line" />
          </button>
          <span className="w-8 text-center text-sm font-semibold text-foreground-950">{guests}</span>
          <button
            type="button"
            aria-label="More guests"
            onClick={() => setGuests((g) => Math.min(venue.maxGuests, g + 1))}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-background-300 text-foreground-700 hover:bg-background-100"
          >
            <i className="ri-add-line" />
          </button>
          <span className="text-xs text-foreground-500">max {venue.maxGuests}</span>
        </div>
      </div>

      <div className="mt-4 space-y-2 rounded-xl bg-background-100 p-3 text-sm">
        <div className="flex items-center justify-between text-foreground-700">
          <span>
            KES {venue.pricePerNight.toLocaleString()} × {nights} night{nights > 1 ? "s" : ""}
          </span>
          <span>KES {subtotal.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between border-t border-background-200 pt-2 font-semibold text-foreground-950">
          <span>Total</span>
          <span>KES {subtotal.toLocaleString()}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onReserve(checkIn, checkOut, guests)}
        className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 py-3 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
      >
        <i className="ri-calendar-check-line text-lg" />
        Reserve now
      </button>

      <p className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-foreground-500">
        <i className="ri-shield-check-fill text-primary-500" />
        You won't be charged yet · free cancellation up to 48h
      </p>
    </div>
  );
}