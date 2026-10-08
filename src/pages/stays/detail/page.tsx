import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import BookingSheet from "@/components/feature/BookingSheet";
import { reviewWord } from "@/components/feature/VenueCard";
import StayBookingWidget from "@/pages/stays/components/StayBookingWidget";
import { useAppData } from "@/store/AppDataProvider";

interface ReserveValues {
  checkIn: string;
  checkOut: string;
  guests: number;
}

export default function StayDetail() {
  const { id = "" } = useParams();
  const { getVenue } = useAppData();
  const venue = getVenue(id);
  const [sheet, setSheet] = useState<"meetup" | "stay" | null>(null);
  const [saved, setSaved] = useState(false);
  const [reserve, setReserve] = useState<ReserveValues | null>(null);

  if (!venue) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-24 text-center">
        <i className="ri-hotel-line text-4xl text-foreground-400" />
        <p className="text-sm text-foreground-600">We couldn't find that stay.</p>
        <Link to="/stays" className="text-sm font-semibold text-primary-600">
          Back to stays
        </Link>
      </div>
    );
  }

  const isHotel = venue.type === "hotel";
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    `${venue.estate}, ${venue.city}`,
  )}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  const handleReserve = (checkIn: string, checkOut: string, guests: number) => {
    setReserve({ checkIn, checkOut, guests });
    setSheet("stay");
  };

  const todayIso = new Date().toISOString().slice(0, 10);
  const tomorrowIso = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  return (
    <>
      <div className="sticky top-14 z-30 border-b border-background-200/80 bg-background-50/95 backdrop-blur-md lg:top-0">
        <div className="mx-auto flex max-w-[1100px] items-center gap-3 px-3 py-2.5">
          <Link to="/stays" aria-label="Back" className="flex h-9 w-9 items-center justify-center text-foreground-900">
            <i className="ri-arrow-left-line text-2xl" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground-950">{venue.name}</p>
            <p className="truncate text-[11px] text-foreground-500">
              {venue.estate}, {venue.city} · ★ {venue.rating.toFixed(1)}
            </p>
          </div>
          <button
            type="button"
            aria-label="Save"
            onClick={() => setSaved((v) => !v)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center text-foreground-800"
          >
            <i className={saved ? "ri-bookmark-fill text-primary-500" : "ri-bookmark-line"} />
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1100px] lg:border-x lg:border-background-200/70">
        <div className="grid grid-cols-1 gap-6 px-4 py-5 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
              <div className="h-56 w-full overflow-hidden rounded-xl sm:col-span-2 sm:h-80">
                <img
                  src={venue.image}
                  alt={venue.name}
                  title={`${venue.name} in ${venue.estate}, ${venue.city}`}
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div className="hidden w-full overflow-hidden rounded-xl sm:block sm:h-80">
                <img
                  src={venue.secondImage}
                  alt={`${venue.name} interior`}
                  title={`${venue.name} — ${isHotel ? "hotel" : "stay"} interior`}
                  className="h-full w-full object-cover object-top"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-background-100 px-3 py-1.5 text-xs font-semibold text-foreground-800">
                <i className={isHotel ? "ri-hotel-line text-primary-600" : "ri-home-heart-line text-secondary-700"} />
                {isHotel ? "Hotel" : "Airbnb stay"}
              </span>
              {venue.meetupReady ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-primary-500 px-3 py-1.5 text-xs font-semibold text-background-50">
                  <i className="ri-shield-check-fill" />
                  Meetup friendly
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1 rounded-md bg-accent-100 px-3 py-1.5 text-xs font-semibold text-accent-800">
                <i className="ri-map-pin-2-fill" />
                Great location
              </span>
            </div>

            <h1 className="mt-3 font-heading text-2xl font-semibold text-foreground-950">{venue.name}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-foreground-600">
              <i className="ri-map-pin-line text-primary-600" />
              {venue.estate}, {venue.city}, {venue.country}
            </p>

            <div className="mt-3 inline-flex items-center gap-3 rounded-xl bg-background-100 px-3 py-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-foreground-950 text-sm font-semibold text-background-50">
                {venue.rating.toFixed(1)}
              </span>
              <div>
                <p className="text-xs font-semibold text-foreground-950">{reviewWord(venue.rating)}</p>
                <p className="text-[11px] text-foreground-500">{venue.reviews} reviews from guests</p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-primary-200 bg-primary-50 p-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-primary-900">
                <i className="ri-sparkling-2-fill" />
                Why guests love it
              </h2>
              <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[...venue.highlights, "Payment released only after check-in"].slice(0, 4).map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-primary-900">
                    <i className="ri-checkbox-circle-fill" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-foreground-800">{venue.description}</p>

            <h2 className="mt-6 text-xs font-semibold uppercase tracking-wide text-foreground-500">
              Most popular facilities
            </h2>
            <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {venue.amenities.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-foreground-800">
                  <i className="ri-checkbox-circle-line text-secondary-600" />
                  {item}
                </li>
              ))}
              <li className="flex items-center gap-2 text-sm text-foreground-800">
                <i className="ri-group-line text-secondary-600" />
                Sleeps up to {venue.maxGuests} guests
              </li>
            </ul>

            <h2 className="mt-6 text-xs font-semibold uppercase tracking-wide text-foreground-500">House rules</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {venue.houseRules.map((rule) => (
                <li
                  key={rule}
                  className="inline-flex items-center gap-1.5 rounded-md bg-background-100 px-3 py-1.5 text-xs font-medium text-foreground-700"
                >
                  <i className="ri-information-line" />
                  {rule}
                </li>
              ))}
            </ul>

            <h2 className="mt-6 text-xs font-semibold uppercase tracking-wide text-foreground-500">Location</h2>
            <div className="mt-2 overflow-hidden rounded-xl border border-background-200/80">
              <iframe title={`Map of ${venue.name}`} src={mapSrc} className="h-52 w-full border-0" loading="lazy" />
              <p className="bg-background-50 px-3 py-2 text-xs text-foreground-600">
                Exact address and check-in details are shared right after you book.
              </p>
            </div>
          </div>

          <aside className="lg:block">
            <div className="lg:sticky lg:top-6">
              <StayBookingWidget venue={venue} onReserve={handleReserve} />
              {venue.meetupReady ? (
                <button
                  type="button"
                  onClick={() => setSheet("meetup")}
                  className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-primary-300 bg-primary-50 px-4 py-2.5 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-100"
                >
                  <i className="ri-hearts-line" />
                  Use venue for a meetup
                </button>
              ) : null}
              <p className="mt-3 text-center text-[11px] text-foreground-400">
                Hosted by {venue.hostName} · Heramio-vetted
              </p>
            </div>
          </aside>
        </div>

        <div className="sticky bottom-16 z-20 flex items-center gap-3 border-t border-background-200/80 bg-background-50/95 px-4 py-3 backdrop-blur-md lg:hidden">
          <div className="shrink-0">
            <p className="font-heading text-lg font-semibold text-foreground-950">
              KES {venue.pricePerNight.toLocaleString()}
            </p>
            <p className="text-[11px] text-foreground-500">per night</p>
          </div>
          <button
            type="button"
            onClick={() => handleReserve(todayIso, tomorrowIso, 2)}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            <i className="ri-calendar-check-line" />
            Reserve
          </button>
        </div>
      </div>

      <BookingSheet
        open={sheet !== null}
        onClose={() => setSheet(null)}
        mode={sheet ?? "stay"}
        venue={venue}
        initialCheckIn={reserve?.checkIn}
        initialCheckOut={reserve?.checkOut}
        initialGuests={reserve?.guests}
      />
    </>
  );
}