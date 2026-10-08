export type StayType = "all" | "hotel" | "airbnb";

interface StayFiltersProps {
  type: StayType;
  onType: (value: StayType) => void;
  maxPrice: number;
  priceBound: number;
  onMaxPrice: (value: number) => void;
  minRating: number;
  onMinRating: (value: number) => void;
  amenities: string[];
  amenityOptions: string[];
  onToggleAmenity: (value: string) => void;
  onReset: () => void;
}

const typeOptions: { key: StayType; label: string; icon: string }[] = [
  { key: "all", label: "All", icon: "ri-apps-2-line" },
  { key: "hotel", label: "Hotels", icon: "ri-hotel-line" },
  { key: "airbnb", label: "Airbnbs", icon: "ri-home-heart-line" },
];

const ratingOptions = [
  { value: 0, label: "Any" },
  { value: 4, label: "4.0+" },
  { value: 4.5, label: "4.5+" },
  { value: 4.8, label: "4.8+" },
];

export default function StayFilters({
  type,
  onType,
  maxPrice,
  priceBound,
  onMaxPrice,
  minRating,
  onMinRating,
  amenities,
  amenityOptions,
  onToggleAmenity,
  onReset,
}: StayFiltersProps) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground-500">Property type</h3>
        <div className="flex gap-1.5 rounded-full bg-background-200/70 px-1 py-1">
          {typeOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => onType(option.key)}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-1 whitespace-nowrap rounded-full px-2 py-1.5 text-xs font-medium transition-colors ${
                type === option.key ? "bg-background-50 text-foreground-950" : "text-foreground-600"
              }`}
            >
              <i className={option.icon} />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground-500">Your budget</h3>
          <span className="text-xs font-semibold text-foreground-900">
            up to KES {maxPrice.toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min={1000}
          max={priceBound}
          step={500}
          value={maxPrice}
          onChange={(event) => onMaxPrice(Number(event.target.value))}
          className="w-full cursor-pointer accent-primary-500"
        />
        <div className="mt-1 flex justify-between text-[11px] text-foreground-500">
          <span>KES 1,000</span>
          <span>KES {priceBound.toLocaleString()}</span>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground-500">Review score</h3>
        <div className="flex flex-wrap gap-1.5">
          {ratingOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onMinRating(option.value)}
              className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                minRating === option.value
                  ? "bg-foreground-950 text-background-50"
                  : "bg-background-100 text-foreground-700 hover:bg-background-200/70"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground-500">Amenities</h3>
        <div className="flex flex-wrap gap-1.5">
          {amenityOptions.map((item) => {
            const active = amenities.includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => onToggleAmenity(item)}
                className={`flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "bg-secondary-500 text-background-50"
                    : "bg-background-100 text-foreground-700 hover:bg-background-200/70"
                }`}
              >
                {active ? <i className="ri-checkbox-circle-fill" /> : <i className="ri-add-line" />}
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="flex w-full cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 px-4 py-2 text-xs font-semibold text-foreground-700"
      >
        <i className="ri-refresh-line" />
        Clear all filters
      </button>
    </div>
  );
}