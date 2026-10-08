import { useMemo, useState } from "react";
import TopBar from "@/components/feature/TopBar";
import VenueCard from "@/components/feature/VenueCard";
import StaySearchBar from "@/pages/stays/components/StaySearchBar";
import StayFilters, { type StayType } from "@/pages/stays/components/StayFilters";
import { useAppData } from "@/store/AppDataProvider";

const isoDate = (date: Date): string => date.toISOString().slice(0, 10);
const addDays = (date: Date, days: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const sortOptions = [
  { key: "recommended", label: "Our top picks" },
  { key: "priceLow", label: "Price (low to high)" },
  { key: "priceHigh", label: "Price (high to low)" },
  { key: "rating", label: "Best reviewed" },
];

export default function Stays() {
  const { venues } = useAppData();
  const today = new Date();

  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState(isoDate(today));
  const [checkOut, setCheckOut] = useState(isoDate(addDays(today, 2)));
  const [guests, setGuests] = useState(2);

  const [type, setType] = useState<StayType>("all");
  const [maxPrice, setMaxPrice] = useState(0);
  const [minRating, setMinRating] = useState(0);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [sort, setSort] = useState("recommended");
  const [showFilters, setShowFilters] = useState(false);

  const priceBound = useMemo(() => {
    const highest = venues.reduce((max, v) => Math.max(max, v.pricePerNight), 0);
    return Math.max(5000, Math.ceil(highest / 1000) * 1000);
  }, [venues]);

  const amenityOptions = useMemo(() => {
    const counts = new Map<string, number>();
    venues.forEach((v) =>
      v.amenities.forEach((a) => {
        if (a !== "Verified meetup venue") counts.set(a, (counts.get(a) ?? 0) + 1);
      }),
    );
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([key]) => key);
  }, [venues]);

  const effectiveMax = maxPrice === 0 ? priceBound : maxPrice;

  const results = useMemo(() => {
    const query = destination.trim().toLowerCase();
    const filtered = venues.filter((venue) => {
      if (type !== "all" && venue.type !== type) return false;
      if (venue.pricePerNight > effectiveMax) return false;
      if (venue.rating < minRating) return false;
      if (amenities.length && !amenities.every((a) => venue.amenities.includes(a))) return false;
      if (query) {
        const haystack = `${venue.name} ${venue.city} ${venue.estate} ${venue.country}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });

    const sorted = [...filtered];
    if (sort === "priceLow") sorted.sort((a, b) => a.pricePerNight - b.pricePerNight);
    else if (sort === "priceHigh") sorted.sort((a, b) => b.pricePerNight - a.pricePerNight);
    else if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    else sorted.sort((a, b) => b.rating * 100 + b.reviews / 100 - (a.rating * 100 + a.reviews / 100));
    return sorted;
  }, [venues, destination, type, effectiveMax, minRating, amenities, sort]);

  const toggleAmenity = (value: string) => {
    setAmenities((prev) => (prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value]));
  };

  const resetFilters = () => {
    setType("all");
    setMaxPrice(0);
    setMinRating(0);
    setAmenities([]);
    setDestination("");
    setSort("recommended");
  };

  const activeFilterCount =
    (type !== "all" ? 1 : 0) +
    (maxPrice !== 0 ? 1 : 0) +
    (minRating !== 0 ? 1 : 0) +
    amenities.length;

  const filterPanel = (
    <StayFilters
      type={type}
      onType={setType}
      maxPrice={effectiveMax}
      priceBound={priceBound}
      onMaxPrice={setMaxPrice}
      minRating={minRating}
      onMinRating={setMinRating}
      amenities={amenities}
      amenityOptions={amenityOptions}
      onToggleAmenity={toggleAmenity}
      onReset={resetFilters}
    />
  );

  return (
    <>
      <TopBar title="Stays" />

      <div className="mx-auto w-full max-w-[1100px] lg:border-x lg:border-background-200/70">
        <div className="border-b border-background-200/70 bg-gradient-to-br from-primary-50 to-accent-50 px-4 py-5">
          <h1 className="font-heading text-2xl font-semibold text-foreground-950">
            Find your stay
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-foreground-700">
            Hotels &amp; Airbnbs across Heramio — with protected payment that only releases to the host after
            check-in. Prices in KES.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background-50/80 px-3 py-1.5 text-xs font-medium text-foreground-800">
              <i className="ri-shield-check-fill text-primary-500" />
              Payment held until check-in
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background-50/80 px-3 py-1.5 text-xs font-medium text-foreground-800">
              <i className="ri-refund-2-line text-secondary-600" />
              Free cancellation up to 48h
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background-50/80 px-3 py-1.5 text-xs font-medium text-foreground-800">
              <i className="ri-car-line text-accent-700" />
              Optional driver pickup
            </span>
          </div>
        </div>

        <div className="px-4 pt-4">
          <StaySearchBar
            destination={destination}
            onDestination={setDestination}
            checkIn={checkIn}
            onCheckIn={setCheckIn}
            checkOut={checkOut}
            onCheckOut={setCheckOut}
            guests={guests}
            onGuests={setGuests}
            onSubmit={() => setShowFilters(false)}
          />
        </div>

        <div className="flex gap-6 px-4 py-5">
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-4 rounded-2xl border border-background-200/80 bg-background-50 p-4">
              <h2 className="mb-4 flex items-center gap-2 font-heading text-sm font-semibold text-foreground-950">
                <i className="ri-filter-3-line text-primary-600" />
                Filter your results
              </h2>
              {filterPanel}
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-background-200/70 pb-3">
              <div>
                <p className="font-heading text-base font-semibold text-foreground-950">
                  {results.length} {results.length === 1 ? "property" : "properties"} found
                </p>
                <p className="text-xs text-foreground-500">
                  {destination.trim() ? `Matching "${destination.trim()}"` : "Everywhere on Heramio"} ·{" "}
                  {guests} {guests === 1 ? "guest" : "guests"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowFilters(true)}
                  className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 px-3 py-2 text-xs font-semibold text-foreground-800 lg:hidden"
                >
                  <i className="ri-filter-3-line" />
                  Filters
                  {activeFilterCount ? (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-500 px-1 text-[10px] text-background-50">
                      {activeFilterCount}
                    </span>
                  ) : null}
                </button>

                <label className="flex items-center gap-2 whitespace-nowrap rounded-md border border-background-300 px-3 py-2 text-xs font-medium text-foreground-700">
                  <i className="ri-sort-desc" />
                  <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value)}
                    className="cursor-pointer bg-transparent text-xs font-semibold text-foreground-900 focus:outline-none"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              {results.map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}

              {results.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-20 text-center">
                  <i className="ri-search-eye-line text-4xl text-foreground-400" />
                  <p className="font-heading text-base font-semibold text-foreground-900">
                    No stays match those filters
                  </p>
                  <p className="max-w-sm text-sm text-foreground-500">
                    Try widening your budget or clearing a filter or two.
                  </p>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="cursor-pointer rounded-md bg-primary-500 px-4 py-2 text-sm font-semibold text-background-50"
                  >
                    Clear filters
                  </button>
                </div>
              ) : null}
            </div>

            <p className="py-8 text-center text-xs text-foreground-400">
              All stays are Heramio-vetted. You pay in app, and the host is only paid after you check in.
            </p>
          </div>
        </div>
      </div>

      {showFilters ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-foreground-950/70 backdrop-blur-sm lg:hidden">
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-background-50">
            <div className="flex items-center justify-between border-b border-background-200/80 px-5 py-4">
              <h2 className="font-heading text-lg font-semibold text-foreground-950">Filter your results</h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setShowFilters(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-foreground-500 hover:bg-background-100"
              >
                <i className="ri-close-line text-2xl" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">{filterPanel}</div>
            <div className="border-t border-background-200/80 px-5 py-4">
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="w-full cursor-pointer whitespace-nowrap rounded-md bg-primary-500 px-5 py-3 text-sm font-semibold text-background-50"
              >
                Show {results.length} {results.length === 1 ? "property" : "properties"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}