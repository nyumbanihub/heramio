import { useEffect, useState } from "react";
import type { Venue } from "@/lib/types";
import { DRIVER_FEE_KES, SERVICE_FEE_KES } from "@/lib/dataApi";
import { useAppData } from "@/store/AppDataProvider";

interface BookingSheetProps {
  open: boolean;
  onClose: () => void;
  mode: "meetup" | "stay";
  partnerName?: string;
  venue?: Venue | null;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
}

const isoDate = (date: Date): string => date.toISOString().slice(0, 10);
const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export default function BookingSheet({
  open,
  onClose,
  mode,
  partnerName,
  venue = null,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
}: BookingSheetProps) {
  const { venues, createBooking } = useAppData();
  const meetupVenues = venues.filter((v) => v.meetupReady);

  const now = new Date();
  const [venueId, setVenueId] = useState("");
  const [date, setDate] = useState(isoDate(now));
  const [time, setTime] = useState("19:00");
  const [checkIn, setCheckIn] = useState(initialCheckIn || isoDate(now));
  const [checkOut, setCheckOut] = useState(initialCheckOut || isoDate(addDays(now, 2)));
  const [guests, setGuests] = useState(initialGuests ?? 2);
  const [driverAddon, setDriverAddon] = useState(false);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const fresh = new Date();
    setVenueId(meetupVenues[0]?.id ?? "");
    setDate(isoDate(fresh));
    setTime("19:00");
    setCheckIn(initialCheckIn || isoDate(fresh));
    setCheckOut(initialCheckOut || isoDate(addDays(fresh, 2)));
    setGuests(initialGuests ?? 2);
    setDriverAddon(false);
    setDone(false);
    setBusy(false);
    setError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialCheckIn, initialCheckOut, initialGuests]);

  if (!open) return null;

  const selectedVenue = meetupVenues.find((v) => v.id === venueId) ?? meetupVenues[0] ?? null;
  const activeVenue = mode === "stay" ? venue : selectedVenue;

  const nights = (() => {
    const diff = Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000);
    return diff > 0 ? diff : 1;
  })();

  const subtotal = venue ? nights * venue.pricePerNight : 0;
  const driverFee = driverAddon ? DRIVER_FEE_KES : 0;
  const total = subtotal + driverFee;

  const handleReserve = async () => {
    if (!venue) return;
    setBusy(true);
    setError("");
    const result = await createBooking({ venue, checkIn, checkOut, guests, nights, driverAddon });
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? "We couldn't complete your booking. Please try again.");
      return;
    }
    setDone(true);
  };

  const kes = (value: number) => `KES ${value.toLocaleString()}`;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-foreground-950/70 backdrop-blur-sm sm:items-center">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-background-50 sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-background-200/80 px-5 py-4">
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground-950">
              {mode === "meetup" ? "Plan a meetup" : "Confirm & reserve"}
            </h2>
            <p className="text-xs text-foreground-500">
              {mode === "meetup"
                ? partnerName
                  ? `With ${partnerName}`
                  : "Choose a verified venue"
                : activeVenue?.name}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-foreground-500 hover:bg-background-100"
          >
            <i className="ri-close-line text-2xl" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary-100 text-secondary-700">
              <i className="ri-checkbox-circle-fill text-4xl" />
            </span>
            <h3 className="font-heading text-xl font-semibold text-foreground-950">
              {mode === "meetup" ? "Meetup requested" : "Stay reserved"}
            </h3>
            <p className="max-w-sm text-sm text-foreground-600">
              {mode === "meetup"
                ? `${selectedVenue?.name ?? "The venue"} has been reserved for ${date} at ${time}. ${
                    partnerName ? `${partnerName} will be notified.` : "Your match will be notified."
                  }`
                : `${venue?.name} is booked for ${nights} night${nights > 1 ? "s" : ""} from ${checkIn}. ${
                    driverAddon ? "A Heramio driver pickup is added. " : ""
                  }Your payment is held safely and released to the host only after you check in.`}
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-background-100 px-3 py-1.5 text-xs font-medium text-foreground-700">
              <i className="ri-shield-check-fill text-primary-500" />
              Heramio protected booking
            </span>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 w-full cursor-pointer whitespace-nowrap rounded-md bg-primary-500 px-5 py-3 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {mode === "meetup" ? (
                <>
                  <div className="flex items-start gap-2 rounded-lg bg-primary-50 px-3 py-2.5 text-xs text-primary-800">
                    <i className="ri-information-line mt-0.5" />
                    <span>
                      For everyone's safety, meetups can <strong>only</strong> happen at a Heramio-verified hotel.
                    </span>
                  </div>

                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-foreground-500">
                    Choose venue
                  </p>
                  <div className="mt-2 space-y-2">
                    {meetupVenues.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setVenueId(option.id)}
                        className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border p-2.5 text-left transition-colors ${
                          venueId === option.id
                            ? "border-primary-400 bg-primary-50"
                            : "border-background-200 hover:bg-background-100"
                        }`}
                      >
                        <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                          <img src={option.image} alt={option.name} className="h-full w-full object-cover object-top" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1 text-sm font-semibold text-foreground-950">
                            {option.name}
                            <i className="ri-verified-badge-fill text-primary-500" />
                          </span>
                          <span className="block truncate text-xs text-foreground-500">
                            {option.estate}, {option.city} · ★ {option.rating}
                          </span>
                        </span>
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                            venueId === option.id ? "border-primary-500 bg-primary-500" : "border-background-300"
                          }`}
                        >
                          {venueId === option.id ? <i className="ri-check-line text-xs text-background-50" /> : null}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-background-200 p-3">
                  <span className="h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                    <img src={activeVenue?.image} alt={activeVenue?.name} className="h-full w-full object-cover object-top" />
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 text-sm font-semibold text-foreground-950">
                      {activeVenue?.name}
                      {activeVenue?.meetupReady ? <i className="ri-verified-badge-fill text-primary-500" /> : null}
                    </p>
                    <p className="text-xs text-foreground-500">
                      {activeVenue?.estate}, {activeVenue?.city}
                    </p>
                    <p className="mt-1 text-xs text-foreground-700">{kes(activeVenue?.pricePerNight ?? 0)} / night</p>
                  </div>
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-3">
                {mode === "meetup" ? (
                  <>
                    <label className="block">
                      <span className="text-xs font-medium text-foreground-600">Date</span>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="mt-1 w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 focus:outline-none focus:ring-2 focus:ring-primary-400"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-foreground-600">Time</span>
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="mt-1 w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 focus:outline-none focus:ring-2 focus:ring-primary-400"
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <label className="block">
                      <span className="text-xs font-medium text-foreground-600">Check-in</span>
                      <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="mt-1 w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 focus:outline-none focus:ring-2 focus:ring-primary-400"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-medium text-foreground-600">Check-out</span>
                      <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="mt-1 w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 focus:outline-none focus:ring-2 focus:ring-primary-400"
                      />
                    </label>
                    <label className="col-span-2 block">
                      <span className="text-xs font-medium text-foreground-600">Guests</span>
                      <div className="mt-1 flex items-center gap-3">
                        <button
                          type="button"
                          aria-label="Fewer guests"
                          onClick={() => setGuests((g) => Math.max(1, g - 1))}
                          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-background-300 text-foreground-700"
                        >
                          <i className="ri-subtract-line" />
                        </button>
                        <span className="w-10 text-center text-sm font-semibold text-foreground-950">{guests}</span>
                        <button
                          type="button"
                          aria-label="More guests"
                          onClick={() => setGuests((g) => Math.min(activeVenue?.maxGuests ?? 4, g + 1))}
                          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-background-300 text-foreground-700"
                        >
                          <i className="ri-add-line" />
                        </button>
                        <span className="text-xs text-foreground-500">max {activeVenue?.maxGuests ?? 4}</span>
                      </div>
                    </label>
                  </>
                )}
              </div>

              {mode === "stay" ? (
                <>
                  <button
                    type="button"
                    onClick={() => setDriverAddon((v) => !v)}
                    className={`mt-4 flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                      driverAddon ? "border-primary-400 bg-primary-50" : "border-background-200 hover:bg-background-100"
                    }`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-100 text-accent-800">
                      <i className="ri-car-line text-xl" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-foreground-950">
                        Add a Heramio driver pickup
                      </span>
                      <span className="block text-xs text-foreground-500">
                        A vetted driver collects you both — home, hotel or airport.
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-sm font-semibold text-foreground-950">{kes(DRIVER_FEE_KES)}</span>
                      <span
                        className={`mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                          driverAddon ? "border-primary-500 bg-primary-500" : "border-background-300"
                        }`}
                      >
                        {driverAddon ? <i className="ri-check-line text-xs text-background-50" /> : null}
                      </span>
                    </span>
                  </button>

                  <div className="mt-4 space-y-2 rounded-xl bg-background-100 p-4 text-sm">
                    <div className="flex items-center justify-between text-foreground-700">
                      <span>
                        {kes(activeVenue?.pricePerNight ?? 0)} × {nights} night{nights > 1 ? "s" : ""}
                      </span>
                      <span>{kes(subtotal)}</span>
                    </div>
                    {driverAddon ? (
                      <div className="flex items-center justify-between text-foreground-700">
                        <span className="flex items-center gap-1.5">
                          <i className="ri-car-line" />
                          Driver pickup
                        </span>
                        <span>{kes(driverFee)}</span>
                      </div>
                    ) : null}
                    <div className="flex items-center justify-between border-t border-background-200 pt-2 font-semibold text-foreground-950">
                      <span>Total</span>
                      <span>{kes(total)}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-start gap-2 rounded-lg bg-secondary-50 px-3 py-2.5 text-xs text-secondary-800">
                    <i className="ri-shield-check-line mt-0.5" />
                    <span>
                      Heramio holds your payment and releases it to the host only after you check in. A{" "}
                      {"KES "}
                      {SERVICE_FEE_KES.toLocaleString()} platform fee is deducted from the host's payout.
                    </span>
                  </div>

                  {error ? (
                    <div className="mt-3 flex items-start gap-2 rounded-md border border-primary-200 bg-primary-50 px-3 py-2.5 text-sm text-primary-800">
                      <i className="ri-error-warning-line mt-0.5" />
                      <span>{error}</span>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>

            <div className="border-t border-background-200/80 px-5 py-4">
              <button
                type="button"
                onClick={mode === "stay" ? handleReserve : () => setDone(true)}
                disabled={(mode === "meetup" && !selectedVenue) || busy}
                className="flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-5 py-3 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <i className={busy ? "ri-loader-4-line animate-spin" : "ri-shield-check-line"} />
                {mode === "meetup"
                  ? "Request protected meetup"
                  : busy
                    ? "Reserving..."
                    : `Reserve · ${kes(total)}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}