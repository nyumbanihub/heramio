import { useState } from "react";
import type { NewListingInput } from "@/lib/types";

interface AddListingSheetProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: NewListingInput) => Promise<boolean>;
}

const covers = [
  {
    label: "Hotel",
    url: "https://readdy.ai/api/search-image?query=Warm%20elegant%20boutique%20hotel%20exterior%20at%20dusk%20with%20glowing%20windows%20and%20tall%20palm%20trees%2C%20luxury%20hospitality%20photography%2C%20warm%20amber%20tones%2C%20high%20detail&width=800&height=600&seq=host-cover-hotel-01&orientation=landscape",
  },
  {
    label: "Loft / apartment",
    url: "https://readdy.ai/api/search-image?query=Bright%20modern%20loft%20apartment%20interior%20with%20warm%20natural%20light%20and%20leafy%20plants%2C%20interior%20photography%2C%20warm%20neutral%20tones%2C%20high%20detail&width=800&height=600&seq=host-cover-loft-01&orientation=landscape",
  },
  {
    label: "Coastal villa",
    url: "https://readdy.ai/api/search-image?query=Beautiful%20coastal%20villa%20with%20an%20open%20living%20space%20and%20ocean%20view%20at%20golden%20hour%2C%20interior%20photography%2C%20warm%20tones%2C%20high%20detail&width=800&height=600&seq=host-cover-villa-01&orientation=landscape",
  },
  {
    label: "Garden stay",
    url: "https://readdy.ai/api/search-image?query=Charming%20garden%20cottage%20with%20a%20terrace%20and%20warm%20afternoon%20light%2C%20lifestyle%20interior%20photography%2C%20warm%20earthy%20tones%2C%20high%20detail&width=800&height=600&seq=host-cover-garden-01&orientation=landscape",
  },
];

const amenityOptions = [
  "Wi-Fi",
  "Pool",
  "Spa",
  "Free parking",
  "Breakfast",
  "Bar",
  "Gym",
  "Beach access",
  "Self check-in",
  "Workspace",
];

const fieldClass =
  "w-full rounded-lg border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200";
const labelClass = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-foreground-600";

export default function AddListingSheet({ open, onClose, onSubmit }: AddListingSheetProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"hotel" | "airbnb">("hotel");
  const [city, setCity] = useState("");
  const [estate, setEstate] = useState("");
  const [country, setCountry] = useState("Kenya");
  const [price, setPrice] = useState(12000);
  const [maxGuests, setMaxGuests] = useState(2);
  const [description, setDescription] = useState("");
  const [amenities, setAmenities] = useState<string[]>(["Wi-Fi"]);
  const [cover, setCover] = useState(covers[0].url);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const toggleAmenity = (value: string) => {
    setAmenities((prev) => (prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value]));
  };

  const submit = async () => {
    setError("");
    if (!name.trim()) return setError("Give your listing a name.");
    if (!city.trim()) return setError("Which city is it in?");
    if (!estate.trim()) return setError("Add the estate or area.");
    if (price < 500) return setError("Set a nightly price in KES.");

    setBusy(true);
    const ok = await onSubmit({
      name: name.trim(),
      type,
      city: city.trim(),
      estate: estate.trim(),
      country: country.trim() || "Kenya",
      pricePerNight: Math.round(price),
      maxGuests,
      description: description.trim() || "A welcoming stay hosted on Heramio.",
      amenities,
      imageUrl: cover,
    });
    setBusy(false);
    if (!ok) {
      setError("We couldn't publish your listing. Please try again.");
      return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-foreground-950/70 backdrop-blur-sm sm:items-center">
      <div className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl bg-background-50 sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-background-200/80 px-5 py-4">
          <div>
            <h2 className="font-heading text-lg font-semibold text-foreground-950">Add a listing</h2>
            <p className="text-xs text-foreground-500">Publish your hotel or Airbnb on Heramio</p>
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

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div>
            <span className={labelClass}>Property type</span>
            <div className="flex gap-1.5 rounded-full bg-background-200/70 px-1 py-1">
              {(["hotel", "airbnb"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setType(option)}
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium capitalize transition-colors ${
                    type === option ? "bg-background-50 text-foreground-950" : "text-foreground-600"
                  }`}
                >
                  <i className={option === "hotel" ? "ri-hotel-line" : "ri-home-heart-line"} />
                  {option === "hotel" ? "Hotel" : "Airbnb"}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className={labelClass}>Listing name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. The Riverside Suites"
              className={fieldClass}
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="block">
              <span className={labelClass}>Country</span>
              <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className={fieldClass} />
            </label>
            <label className="block">
              <span className={labelClass}>City</span>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Nairobi"
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Estate / area</span>
              <input
                type="text"
                value={estate}
                onChange={(e) => setEstate(e.target.value)}
                placeholder="Westlands"
                className={fieldClass}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={labelClass}>Price per night (KES)</span>
              <input
                type="number"
                min={500}
                step={500}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value) || 0)}
                className={fieldClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Max guests</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMaxGuests((g) => Math.max(1, g - 1))}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-background-300 text-foreground-700"
                >
                  <i className="ri-subtract-line" />
                </button>
                <span className="w-8 text-center text-sm font-semibold text-foreground-950">{maxGuests}</span>
                <button
                  type="button"
                  onClick={() => setMaxGuests((g) => Math.min(12, g + 1))}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-background-300 text-foreground-700"
                >
                  <i className="ri-add-line" />
                </button>
              </div>
            </label>
          </div>

          <label className="block">
            <span className={labelClass}>Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 400))}
              rows={3}
              maxLength={400}
              placeholder="Describe what makes your place special."
              className={`${fieldClass} resize-none`}
            />
          </label>

          <div>
            <span className={labelClass}>Amenities</span>
            <div className="flex flex-wrap gap-1.5">
              {amenityOptions.map((item) => {
                const active = amenities.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleAmenity(item)}
                    className={`flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      active ? "bg-secondary-500 text-background-50" : "bg-background-100 text-foreground-700"
                    }`}
                  >
                    {active ? <i className="ri-checkbox-circle-fill" /> : <i className="ri-add-line" />}
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className={labelClass}>Cover photo</span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {covers.map((option) => (
                <button
                  key={option.url}
                  type="button"
                  onClick={() => setCover(option.url)}
                  className={`overflow-hidden rounded-lg border-2 transition-colors ${
                    cover === option.url ? "border-primary-500" : "border-transparent"
                  }`}
                >
                  <span className="block h-20 w-full overflow-hidden">
                    <img src={option.url} alt={option.label} className="h-full w-full object-cover object-top" />
                  </span>
                  <span className="block bg-background-50 px-1 py-1 text-[10px] font-medium text-foreground-700">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {error ? (
            <div className="flex items-start gap-2 rounded-md border border-primary-200 bg-primary-50 px-3 py-2.5 text-sm text-primary-800">
              <i className="ri-error-warning-line mt-0.5" />
              <span>{error}</span>
            </div>
          ) : null}
        </div>

        <div className="border-t border-background-200/80 px-5 py-4">
          <button
            type="button"
            onClick={submit}
            disabled={busy}
            className="flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-5 py-3 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:opacity-60"
          >
            <i className={busy ? "ri-loader-4-line animate-spin" : "ri-add-line"} />
            {busy ? "Publishing..." : "Publish listing"}
          </button>
        </div>
      </div>
    </div>
  );
}