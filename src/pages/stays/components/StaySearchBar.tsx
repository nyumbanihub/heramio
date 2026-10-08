interface StaySearchBarProps {
  destination: string;
  onDestination: (value: string) => void;
  checkIn: string;
  onCheckIn: (value: string) => void;
  checkOut: string;
  onCheckOut: (value: string) => void;
  guests: number;
  onGuests: (value: number) => void;
  onSubmit: () => void;
}

const fieldClass =
  "w-full rounded-lg border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200";
const labelClass = "mb-1 block text-[11px] font-semibold uppercase tracking-wide text-foreground-500";

export default function StaySearchBar({
  destination,
  onDestination,
  checkIn,
  onCheckIn,
  checkOut,
  onCheckOut,
  guests,
  onGuests,
  onSubmit,
}: StaySearchBarProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="rounded-2xl border border-background-200/80 bg-background-50 p-3"
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_0.9fr_auto]">
        <label className="block">
          <span className={labelClass}>Where to?</span>
          <span className="relative flex items-center">
            <i className="ri-search-line pointer-events-none absolute left-3 text-base text-foreground-400" />
            <input
              type="text"
              value={destination}
              onChange={(event) => onDestination(event.target.value)}
              placeholder="City, estate or property"
              className={`${fieldClass} pl-9`}
            />
          </span>
        </label>

        <label className="block">
          <span className={labelClass}>Check-in</span>
          <input type="date" value={checkIn} onChange={(e) => onCheckIn(e.target.value)} className={fieldClass} />
        </label>

        <label className="block">
          <span className={labelClass}>Check-out</span>
          <input type="date" value={checkOut} onChange={(e) => onCheckOut(e.target.value)} className={fieldClass} />
        </label>

        <label className="block">
          <span className={labelClass}>Guests</span>
          <span className="relative flex items-center">
            <i className="ri-user-3-line pointer-events-none absolute left-3 text-base text-foreground-400" />
            <input
              type="number"
              min={1}
              max={10}
              value={guests}
              onChange={(e) => onGuests(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
              className={`${fieldClass} pl-9`}
            />
          </span>
        </label>

        <div className="flex items-end">
          <button
            type="submit"
            className="flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 lg:w-auto"
          >
            <i className="ri-search-line text-lg" />
            Search
          </button>
        </div>
      </div>
    </form>
  );
}