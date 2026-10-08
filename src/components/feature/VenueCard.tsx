import { Link } from "react-router-dom";
import type { Venue } from "@/lib/types";

export const reviewWord = (score: number): string => {
  if (score >= 4.8) return "Exceptional";
  if (score >= 4.5) return "Excellent";
  if (score >= 4.2) return "Very good";
  if (score >= 4.0) return "Good";
  return "Pleasant";
};

const kes = (value: number): string => `KES ${value.toLocaleString()}`;

export default function VenueCard({ venue }: { venue: Venue }) {
  const isHotel = venue.type === "hotel";

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-background-200/80 bg-background-50 transition-colors hover:border-background-300 lg:flex-row">
      <Link
        to={`/stays/${venue.id}`}
        className="relative block h-52 w-full shrink-0 overflow-hidden lg:h-auto lg:w-60"
      >
        <img
          src={venue.image}
          alt={venue.name}
          title={`${venue.name} — ${isHotel ? "hotel" : "stay"} in ${venue.estate}, ${venue.city}`}
          className="h-full w-full object-cover object-top"
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-background-50/90 px-2 py-1 text-[11px] font-semibold text-foreground-900 backdrop-blur">
          <i className={isHotel ? "ri-hotel-line text-primary-600" : "ri-home-heart-line text-secondary-700"} />
          {isHotel ? "Hotel" : "Airbnb"}
        </span>
        {venue.meetupReady ? (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-md bg-primary-500 px-2 py-1 text-[10px] font-semibold text-background-50">
            <i className="ri-shield-check-fill" />
            Meetup friendly
          </span>
        ) : null}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/stays/${venue.id}`} className="block">
              <h3 className="truncate font-heading text-base font-semibold text-foreground-950">
                {venue.name}
              </h3>
            </Link>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-foreground-600">
              <i className="ri-map-pin-line text-primary-600" />
              {venue.estate}, {venue.city}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-foreground-500">
              <i className="ri-flight-takeoff-line" />
              {venue.country} · {isHotel ? "City hotel" : "Entire apartment"}
            </p>
          </div>

          <div className="flex shrink-0 items-start gap-2">
            <div className="text-right">
              <p className="text-xs font-semibold text-foreground-950">{reviewWord(venue.rating)}</p>
              <p className="text-[11px] text-foreground-500">{venue.reviews} reviews</p>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground-950 text-sm font-semibold text-background-50">
              {venue.rating.toFixed(1)}
            </span>
          </div>
        </div>

        <ul className="flex flex-wrap gap-1.5">
          {venue.amenities.slice(0, 3).map((item) => (
            <li
              key={item}
              className="inline-flex items-center gap-1 rounded-md bg-secondary-100 px-2 py-1 text-[11px] font-medium text-secondary-900"
            >
              <i className="ri-check-line" />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-background-200/70 pt-3">
          <div>
            <p className="font-heading text-lg font-semibold text-foreground-950">{kes(venue.pricePerNight)}</p>
            <p className="text-[11px] text-foreground-500">per night · taxes &amp; fees included</p>
          </div>
          <Link
            to={`/stays/${venue.id}`}
            className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            View availability
            <i className="ri-arrow-right-line" />
          </Link>
        </div>
      </div>
    </article>
  );
}