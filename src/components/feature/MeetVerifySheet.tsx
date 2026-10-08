import { useEffect, useState } from "react";
import type { StayBooking } from "@/lib/types";

interface MeetVerifySheetProps {
  open: boolean;
  onClose: () => void;
  booking: StayBooking | null;
  perspective: "guest" | "host";
  onVerify: (
    booking: StayBooking,
    code: string,
  ) => Promise<{ ok: boolean; released?: boolean; error?: string }>;
}

export default function MeetVerifySheet({
  open,
  onClose,
  booking,
  perspective,
  onVerify,
}: MeetVerifySheetProps) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [justReleased, setJustReleased] = useState(false);
  const [confirmedLocal, setConfirmedLocal] = useState(false);

  const otherLabel = perspective === "guest" ? "host" : "guest";
  const propConfirmed =
    perspective === "guest" ? Boolean(booking?.guestConfirmed) : Boolean(booking?.hostConfirmed);
  const myConfirmed = propConfirmed || confirmedLocal;
  const otherConfirmed =
    perspective === "guest" ? Boolean(booking?.hostConfirmed) : Boolean(booking?.guestConfirmed);
  const bothConfirmed = Boolean(booking?.guestConfirmed && booking?.hostConfirmed);
  const done = bothConfirmed || justReleased;

  useEffect(() => {
    if (!open) return;
    setCode("");
    setBusy(false);
    setError("");
    setJustReleased(false);
    setConfirmedLocal(false);
  }, [open, booking?.id]);

  if (!open || !booking) return null;

  const handleSubmit = async () => {
    if (code.length !== 6) {
      setError("Type the full 6-digit code.");
      return;
    }
    setBusy(true);
    setError("");
    const result = await onVerify(booking, code);
    setBusy(false);
    if (!result.ok) {
      setError(result.error || "That code didn't match. Please try again.");
      return;
    }
    if (result.released) setJustReleased(true);
    setConfirmedLocal(true);
    setCode("");
  };

  const digits = (booking.meetCode || "------").padEnd(6, "-").slice(0, 6).split("");

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-foreground-950/70 backdrop-blur-sm sm:items-center">
      <div className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-background-50 sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-background-200/80 px-5 py-4">
          <div className="min-w-0">
            <h2 className="font-heading text-lg font-semibold text-foreground-950">
              {done ? "Meet verified" : "Confirm you met"}
            </h2>
            <p className="truncate text-xs text-foreground-500">{booking.venueName}</p>
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

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {done ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                <i className="ri-shield-check-fill text-4xl" />
              </span>
              <h3 className="font-heading text-xl font-semibold text-foreground-950">
                You both confirmed
              </h3>
              <p className="max-w-sm text-sm text-foreground-600">
                {perspective === "host"
                  ? `KES ${Math.round(booking.hostPayout).toLocaleString()} has been released to your balance. You can withdraw it any time.`
                  : "Heramio has released the payment to your host. Enjoy your stay!"}
              </p>
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
              <div className="flex items-start gap-2 rounded-lg bg-secondary-50 px-3 py-2.5 text-xs text-secondary-800">
                <i className="ri-information-line mt-0.5" />
                <span>
                  Meet in person, then each type the code shown on the other person's phone. The moment
                  both codes are in, Heramio releases the payment to the host.
                </span>
              </div>

              <div className="mt-5 rounded-2xl border border-primary-200 bg-primary-50 p-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">
                  Your code — show this to your {otherLabel}
                </p>
                <div className="mt-3 flex justify-center gap-2">
                  {digits.map((d, i) => (
                    <span
                      key={`${d}-${i}`}
                      className="flex h-12 w-10 items-center justify-center rounded-lg bg-background-50 font-heading text-2xl font-semibold text-foreground-950"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-foreground-600">
                    Enter the code on your {otherLabel}'s phone
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                    placeholder="000000"
                    className="w-full rounded-md border border-background-300 bg-background-50 px-3 py-3 text-center font-heading text-2xl tracking-[0.5em] text-foreground-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  />
                </label>

                {error ? (
                  <div className="mt-3 flex items-start gap-2 rounded-md border border-primary-200 bg-primary-50 px-3 py-2.5 text-sm text-primary-800">
                    <i className="ri-error-warning-line mt-0.5" />
                    <span>{error}</span>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={busy || code.length !== 6}
                  className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-5 py-3 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? <i className="ri-loader-4-line animate-spin" /> : <i className="ri-shield-check-line" />}
                  Confirm meet
                </button>
              </div>

              <div className="mt-5 space-y-2 rounded-xl bg-background-100 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-foreground-700">
                    <i className="ri-user-line" />
                    You
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold ${
                      myConfirmed ? "text-primary-700" : "text-foreground-500"
                    }`}
                  >
                    <i className={myConfirmed ? "ri-checkbox-circle-fill" : "ri-time-line"} />
                    {myConfirmed ? "Confirmed" : "Waiting"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-foreground-700">
                    <i className="ri-user-star-line" />
                    Your {otherLabel}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold ${
                      otherConfirmed ? "text-primary-700" : "text-foreground-500"
                    }`}
                  >
                    <i className={otherConfirmed ? "ri-checkbox-circle-fill" : "ri-time-line"} />
                    {otherConfirmed ? "Confirmed" : "Waiting"}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}