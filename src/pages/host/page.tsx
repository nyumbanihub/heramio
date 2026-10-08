import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import TopBar from "@/components/feature/TopBar";
import AddListingSheet from "@/pages/host/components/AddListingSheet";
import MeetVerifySheet from "@/components/feature/MeetVerifySheet";
import { useAppData } from "@/store/AppDataProvider";
import type { StayBooking } from "@/lib/types";

const statusMeta: Record<string, { label: string; className: string }> = {
  confirmed: { label: "Awaiting check-in", className: "bg-accent-100 text-accent-800" },
  checked_in: { label: "Checked in", className: "bg-secondary-100 text-secondary-900" },
  completed: { label: "Completed · paid", className: "bg-primary-100 text-primary-800" },
  cancelled: { label: "Cancelled", className: "bg-background-200 text-foreground-600" },
};

export default function HostDashboard() {
  const {
    role,
    setRole,
    me,
    hostListings,
    hostBookings,
    wallet,
    withdraw,
    verifyMeet,
    addListing,
    savePayoutDetails,
  } = useAppData();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [verifyBooking, setVerifyBooking] = useState<StayBooking | null>(null);
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState("M-Pesa");
  const [payoutMethod, setPayoutMethod] = useState("M-Pesa Paybill");
  const [payoutNumber, setPayoutNumber] = useState("");
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);

  const flash = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };

  const onHold = useMemo(
    () => hostBookings.filter((b) => b.payoutStatus === "held").reduce((sum, b) => sum + b.hostPayout, 0),
    [hostBookings],
  );

  const kes = (value: number) => `${wallet.currency} ${Math.round(value).toLocaleString()}`;

  if (role !== "host") {
    return (
      <>
        <TopBar title="Become a host" />
        <div className="mx-auto flex w-full max-w-[640px] flex-col items-center px-4 py-16 text-center lg:border-x lg:border-background-200/70">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-background-50">
            <i className="ri-hotel-line text-3xl" />
          </span>
          <h1 className="mt-5 font-heading text-2xl font-semibold text-foreground-950">
            List your hotel or Airbnb
          </h1>
          <p className="mt-2 max-w-md text-sm text-foreground-700">
            Switch to a host account to publish listings, manage bookings and get paid. Guests pay in app and
            you're paid after check-in — minus a {kes(130)} platform fee per booking.
          </p>
          <ul className="mt-6 w-full max-w-sm space-y-2 text-left">
            {[
              "Add and edit your listings anytime",
              "See every booking and guest detail",
              "Withdraw your earnings to M-Pesa or bank",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-foreground-800">
                <i className="ri-checkbox-circle-fill text-primary-500" />
                {item}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setRole("host")}
            className="mt-6 w-full max-w-sm cursor-pointer whitespace-nowrap rounded-md bg-primary-500 px-5 py-3 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            Become a host
          </button>
          <Link to="/stays" className="mt-3 text-xs font-semibold text-primary-600">
            Or keep browsing stays
          </Link>
        </div>
      </>
    );
  }

  const handleWithdraw = async () => {
    const withdrew = await withdraw(amount, method);
    setWithdrawOpen(false);
    flash(withdrew > 0 ? `Withdrawal of ${kes(withdrew)} requested` : "Nothing to withdraw yet");
  };

  return (
    <>
      <TopBar title="Host dashboard" />

      <div className="mx-auto w-full max-w-[936px] lg:border-x lg:border-background-200/70">
        <div className="border-b border-background-200/70 bg-gradient-to-br from-primary-50 to-accent-50 px-4 py-5">
          <h1 className="font-heading text-xl font-semibold text-foreground-950">
            Welcome back{me?.name ? `, ${me.name}` : ""}
          </h1>
          <p className="mt-1 text-sm text-foreground-700">
            Manage your listings, track bookings and withdraw your earnings.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-background-200/80 bg-background-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground-500">Available</p>
            <p className="mt-1 font-heading text-2xl font-semibold text-foreground-950">{kes(wallet.available)}</p>
            <button
              type="button"
              disabled={wallet.available <= 0}
              onClick={() => {
                setAmount(Math.floor(wallet.available));
                setWithdrawOpen(true);
              }}
              className="mt-3 flex w-full cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <i className="ri-bank-card-line" />
              Withdraw
            </button>
          </div>

          <div className="rounded-2xl border border-background-200/80 bg-background-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground-500">On hold</p>
            <p className="mt-1 font-heading text-2xl font-semibold text-foreground-950">{kes(onHold)}</p>
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-foreground-500">
              <i className="ri-lock-2-line text-accent-700" />
              Released to you after check-in
            </p>
          </div>

          <div className="rounded-2xl border border-background-200/80 bg-background-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground-500">Lifetime earnings</p>
            <p className="mt-1 font-heading text-2xl font-semibold text-foreground-950">
              {kes(wallet.lifetimeEarnings)}
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-foreground-500">
              <i className="ri-percent-line text-primary-600" />
              {kes(130)} fee per booking
            </p>
          </div>
        </div>

        <section className="border-t border-background-200/70 px-4 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading text-lg font-semibold text-foreground-950">
              Your listings <span className="text-sm font-normal text-foreground-500">({hostListings.length})</span>
            </h2>
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600"
            >
              <i className="ri-add-line" />
              Add listing
            </button>
          </div>

          {hostListings.length === 0 ? (
            <div className="mt-4 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-background-300 py-10 text-center">
              <i className="ri-home-4-line text-3xl text-foreground-400" />
              <p className="text-sm font-semibold text-foreground-900">No listings yet</p>
              <p className="max-w-xs text-xs text-foreground-500">
                Publish your first hotel or Airbnb and it will appear in the stays search.
              </p>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {hostListings.map((listing) => (
                <article key={listing.id} className="flex gap-3 rounded-2xl border border-background-200/80 bg-background-50 p-3">
                  <span className="h-20 w-24 shrink-0 overflow-hidden rounded-lg">
                    <img
                      src={listing.image}
                      alt={listing.name}
                      className="h-full w-full object-cover object-top"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-heading text-sm font-semibold text-foreground-950">
                      {listing.name}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-foreground-500">
                      <i className="ri-map-pin-line" />
                      {listing.estate}, {listing.city}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground-950">
                      {kes(listing.pricePerNight)} <span className="text-xs font-normal text-foreground-500">/ night</span>
                    </p>
                    <Link
                      to={`/stays/${listing.id}`}
                      className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary-600"
                    >
                      View page
                      <i className="ri-arrow-right-line" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="border-t border-background-200/70 px-4 py-5">
          <h2 className="font-heading text-lg font-semibold text-foreground-950">
            Bookings <span className="text-sm font-normal text-foreground-500">({hostBookings.length})</span>
          </h2>

          {hostBookings.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-background-300 py-10 text-center">
              <i className="ri-calendar-line text-3xl text-foreground-400" />
              <p className="mt-2 text-sm text-foreground-500">No bookings on your listings yet.</p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {hostBookings.map((booking) => {
                const meta = statusMeta[booking.status] ?? statusMeta.confirmed;
                return (
                  <article key={booking.id} className="rounded-2xl border border-background-200/80 bg-background-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-heading text-sm font-semibold text-foreground-950">{booking.venueName}</h3>
                        <p className="mt-0.5 text-xs text-foreground-600">
                          {booking.guestName} · {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-foreground-500">
                          <i className="ri-calendar-line" />
                          {booking.checkIn} → {booking.checkOut} · {booking.nights} night
                          {booking.nights > 1 ? "s" : ""}
                        </p>
                        {booking.driverAddon ? (
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-accent-700">
                            <i className="ri-car-line" />
                            Heramio driver pickup added
                          </p>
                        ) : null}
                      </div>
                      <div className="text-right">
                        <span className={`inline-block rounded-md px-2.5 py-1 text-[11px] font-semibold ${meta.className}`}>
                          {meta.label}
                        </span>
                        <p className="mt-1.5 font-heading text-base font-semibold text-foreground-950">
                          {kes(booking.hostPayout)}
                        </p>
                        <p className="text-[11px] text-foreground-500">your payout</p>
                      </div>
                    </div>

                    {booking.payoutStatus === "held" ? (
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-secondary-50 px-3 py-2.5">
                        <p className="flex items-center gap-1.5 text-[11px] text-secondary-800">
                          <i className="ri-shield-check-line" />
                          {booking.hostConfirmed
                            ? "You confirmed · waiting for the guest to confirm"
                            : `Meet your guest and swap the 6-digit code to release ${kes(booking.hostPayout)}.`}
                        </p>
                        <button
                          type="button"
                          onClick={() => setVerifyBooking(booking)}
                          className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md bg-foreground-950 px-3.5 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-foreground-900"
                        >
                          <i className="ri-shield-check-line" />
                          {booking.hostConfirmed ? "View verification" : "Confirm the meet"}
                        </button>
                      </div>
                    ) : (
                      <p className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-primary-700">
                        <i className="ri-checkbox-circle-fill" />
                        Payout released to your balance
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="border-t border-background-200/70 px-4 py-5">
          <h2 className="font-heading text-lg font-semibold text-foreground-950">Payout details</h2>
          <p className="mt-1 text-xs text-foreground-600">
            Where should we send your earnings? Add an M-Pesa paybill, till or bank account.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-foreground-600">
                Method
              </span>
              <select
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value)}
                className="w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900"
              >
                <option>M-Pesa Paybill</option>
                <option>M-Pesa Till</option>
                <option>Bank transfer</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-foreground-600">
                Number / account
              </span>
              <input
                type="text"
                value={payoutNumber}
                onChange={(e) => setPayoutNumber(e.target.value)}
                placeholder="e.g. 247247 · 0700 000 000"
                className="w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
            </label>
            <button
              type="button"
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                await savePayoutDetails(payoutMethod, payoutNumber.trim());
                setSaving(false);
                flash("Payout details saved");
              }}
              className="flex cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 px-5 py-2.5 text-sm font-semibold text-foreground-800 disabled:opacity-60"
            >
              {saving ? <i className="ri-loader-4-line animate-spin" /> : <i className="ri-save-3-line" />}
              Save
            </button>
          </div>
        </section>

        <p className="py-8 text-center text-xs text-foreground-400">
          Heramio holds guest payments and releases them to hosts after check-in.
        </p>
      </div>

      <AddListingSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onSubmit={addListing} />

      {withdrawOpen ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-foreground-950/70 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-sm overflow-hidden rounded-t-3xl bg-background-50 sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-background-200/80 px-5 py-4">
              <h2 className="font-heading text-lg font-semibold text-foreground-950">Withdraw funds</h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setWithdrawOpen(false)}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-foreground-500 hover:bg-background-100"
              >
                <i className="ri-close-line text-2xl" />
              </button>
            </div>
            <div className="space-y-4 px-5 py-4">
              <div className="rounded-xl bg-background-100 p-3">
                <p className="text-xs text-foreground-500">Available balance</p>
                <p className="font-heading text-xl font-semibold text-foreground-950">{kes(wallet.available)}</p>
              </div>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-foreground-600">
                  Amount (KES)
                </span>
                <input
                  type="number"
                  value={amount}
                  min={0}
                  max={wallet.available}
                  onChange={(e) => setAmount(Math.min(Number(e.target.value) || 0, Math.floor(wallet.available)))}
                  className="w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-foreground-600">
                  Send to
                </span>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900"
                >
                  <option>M-Pesa</option>
                  <option>Bank transfer</option>
                </select>
              </label>
              <button
                type="button"
                onClick={handleWithdraw}
                disabled={amount <= 0}
                className="flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-5 py-3 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:opacity-60"
              >
                <i className="ri-bank-card-line" />
                Withdraw {kes(amount)}
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
        perspective="host"
        onVerify={verifyMeet}
      />
    </>
  );
}