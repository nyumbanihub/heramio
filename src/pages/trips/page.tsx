import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import TopBar from "@/components/feature/TopBar";
import MeetVerifySheet from "@/components/feature/MeetVerifySheet";
import { useAppData } from "@/store/AppDataProvider";
import type { StayBooking } from "@/lib/types";

const tabs = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "cancelled", label: "Cancelled" },
];

const statusBadge: Record<string, { label: string; className: string; icon: string }> = {
  confirmed: { label: "Confirmed", className: "bg-accent-100 text-accent-800", icon: "ri-time-line" },
  checked_in: { label: "Checked in", className: "bg-secondary-100 text-secondary-900", icon: "ri-user-follow-line" },
  completed: { label: "Completed", className: "bg-primary-100 text-primary-800", icon: "ri-checkbox-circle-fill" },
  cancelled: { label: "Cancelled", className: "bg-background-200 text-foreground-600", icon: "ri-close-circle-line" },
};

function formatDate(value: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export default function Trips() {
  const { myBookings, getVenue, cancelBooking, verifyMeet } = useAppData();
  const [tab, setTab] = useState("upcoming");
  const [confirm, setConfirm] = useState<StayBooking | null>(null);
  const [verifyBooking, setVerifyBooking] = useState<StayBooking | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  const grouped = useMemo(() => {
    const upcoming: StayBooking[] = [];
    const past: StayBooking[] = [];
    const cancelled: StayBooking[] = [];
    myBookings.forEach((b) => {
      if (b.status === "cancelled") cancelled.push(b);
      else if (b.status === "completed" || b.checkOut < today) past.push(b);
      else upcoming.push(b);
    });
    return { upcoming, past, cancelled };
  }, [myBookings, today]);

  const list = grouped[tab as keyof typeof grouped] ?? [];

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };

  const handleCancel = async (booking: StayBooking) => {
    setBusy(true);
    const ok = await cancelBooking(booking);
    setBusy(false);
    setConfirm(null);
    flash(ok ? "Booking cancelled" : "Couldn't cancel this booking");
  };

  const kes = (value: number) => `KES ${Math.round(value).toLocaleString()}`;

  return (
    <>
      <TopBar title="My trips" />

      <div className="mx-auto w-full max-w-[820px] lg:border-x lg:border-background-200/70">
        <div className="border-b border-background-200/70 px-4 py-4">
          <h1 className="font-heading text-xl font-semibold text-foreground-950">My trips</h1>
          <p className="mt-1 text-sm text-foreground-600">
            Every hotel and Airbnb you've booked through Heramio.
          </p>
        </div>

        <div className="border-b border-background-200/70 px-4 py-3">
          <div className="flex rounded-full bg-background-200/70 px-1 py-1">
            {tabs.map((item) => {
              const count = grouped[item.key as keyof typeof grouped].length;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTab(item.key)}
                  className={`flex-1 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                    tab === item.key ? "bg-background-50 text-foreground-950" : "text-foreground-600"
                  }`}
                >
                  {item.label}
                  <span className="ml-1.5 text-xs text-foreground-400">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {list.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-background-100 text-foreground-400">
              <i className="ri-suitcase-line text-3xl" />
            </span>
            <p className="text-sm font-semibold text-foreground-900">
              {tab === "cancelled" ? "No cancelled bookings" : "No trips here yet"}
            </p>
            <p className="max-w-xs text-xs text-foreground-500">
              {tab === "upcoming"
                ? "Book a hotel or Airbnb and your stay will show up here."
                : "Your booking history will appear here once you travel."}
            </p>
            <Link
              to="/stays"
              className="mt-1 inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2.5 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600"
            >
              <i className="ri-hotel-line" />
              Browse hotels & stays
            </Link>
          </div>
        ) : (
          <ul className="space-y-4 p-4">
            {list.map((booking) => {
              const venue = getVenue(booking.venueId);
              const badge = statusBadge[booking.status] ?? statusBadge.confirmed;
              const canCancel = booking.status === "confirmed" && booking.checkIn >= today;
              return (
                <li
                  key={booking.id}
                  className="overflow-hidden rounded-2xl border border-background-200/80 bg-background-50"
                >
                  <div className="flex flex-col sm:flex-row">
                    <Link
                      to={`/stays/${booking.venueId}`}
                      className="h-40 w-full shrink-0 overflow-hidden sm:h-auto sm:w-52"
                    >
                      <img
                        src={venue?.image}
                        alt={booking.venueName}
                        className="h-full w-full object-cover object-top"
                      />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h2 className="truncate font-heading text-base font-semibold text-foreground-950">
                            {booking.venueName}
                          </h2>
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-foreground-500">
                            <i className="ri-map-pin-line" />
                            {venue ? `${venue.estate}, ${venue.city}` : booking.hostName}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold ${badge.className}`}
                        >
                          <i className={badge.icon} />
                          {badge.label}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                        <div className="rounded-lg bg-background-100/70 px-3 py-2">
                          <p className="text-foreground-500">Check-in</p>
                          <p className="mt-0.5 font-semibold text-foreground-900">{formatDate(booking.checkIn)}</p>
                        </div>
                        <div className="rounded-lg bg-background-100/70 px-3 py-2">
                          <p className="text-foreground-500">Check-out</p>
                          <p className="mt-0.5 font-semibold text-foreground-900">{formatDate(booking.checkOut)}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-foreground-600">
                        <span className="flex items-center gap-1">
                          <i className="ri-moon-line" />
                          {booking.nights} night{booking.nights > 1 ? "s" : ""}
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="ri-group-line" />
                          {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
                        </span>
                        {booking.driverAddon ? (
                          <span className="flex items-center gap-1 text-accent-700">
                            <i className="ri-car-line" />
                            Driver pickup
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
                        <div>
                          <p className="text-[11px] text-foreground-500">Total paid</p>
                          <p className="font-heading text-base font-semibold text-foreground-950">
                            {kes(booking.total)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {canCancel ? (
                            <button
                              type="button"
                              onClick={() => setConfirm(booking)}
                              className="cursor-pointer whitespace-nowrap rounded-md border border-background-300 px-3.5 py-2 text-xs font-semibold text-foreground-800 transition-colors hover:bg-background-100"
                            >
                              Cancel booking
                            </button>
                          ) : null}
                          <Link
                            to={`/stays/${booking.venueId}`}
                            className="cursor-pointer whitespace-nowrap rounded-md bg-primary-500 px-3.5 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600"
                          >
                            View property
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  {booking.status === "confirmed" ? (
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-background-200/70 bg-secondary-50 px-4 py-2.5">
                      <p className="flex items-center gap-1.5 text-[11px] text-secondary-800">
                        <i className="ri-shield-check-line" />
                        {booking.guestConfirmed
                          ? "You confirmed \u00b7 waiting for your host to confirm"
                          : "Meet your host, then swap the 6-digit code to release payment."}
                      </p>
                      <button
                        type="button"
                        onClick={() => setVerifyBooking(booking)}
                        className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-3 py-1.5 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600"
                      >
                        <i className="ri-shield-check-line" />
                        {booking.guestConfirmed ? "View verification" : "Confirm the meet"}
                      </button>
                    </div>
                  ) : null}
                  {booking.status === "checked_in" ? (
                    <p className="flex items-center gap-1.5 border-t border-background-200/70 bg-primary-50 px-4 py-2 text-[11px] font-medium text-primary-800">
                      <i className="ri-checkbox-circle-fill" />
                      Meet verified \u00b7 payment released to your host
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {confirm ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-foreground-950/50 px-4 pb-6 sm:items-center sm:pb-0">
          <div className="w-full max-w-[380px] rounded-lg border border-background-200 bg-background-50 p-5">
            <h2 className="font-heading text-lg font-semibold text-foreground-950">Cancel this booking?</h2>
            <p className="mt-1 text-sm text-foreground-600">
              {confirm.venueName} · {formatDate(confirm.checkIn)}. Your held payment becomes refundable.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirm(null)}
                className="flex-1 cursor-pointer whitespace-nowrap rounded-md border border-background-300 px-4 py-2.5 text-sm font-semibold text-foreground-800"
              >
                Keep booking
              </button>
              <button
                type="button"
                onClick={() => handleCancel(confirm)}
                disabled={busy}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2.5 text-sm font-semibold text-background-50 transition hover:bg-primary-600 disabled:opacity-60"
              >
                {busy ? <i className="ri-loader-4-line animate-spin" /> : <i className="ri-close-circle-line" />}
                Cancel booking
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

      <MeetVerifySheet
        open={verifyBooking !== null}
        onClose={() => setVerifyBooking(null)}
        booking={verifyBooking}
        perspective="guest"
        onVerify={verifyMeet}
      />
    </>
  );
}