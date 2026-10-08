import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import TopBar from "@/components/feature/TopBar";
import { useAppData } from "@/store/AppDataProvider";

const genderOptions = [
  { key: "any", label: "Everyone" },
  { key: "woman", label: "Women" },
  { key: "man", label: "Men" },
];

const distanceLabel = (km: number): string => {
  if (km <= 0) return "Near you";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 100) return `${km.toFixed(1)} km`;
  return `${Math.round(km).toLocaleString()} km`;
};

const selectClass =
  "w-full appearance-none rounded-md border border-background-300 bg-background-50 px-3 py-2.5 text-sm text-foreground-900 transition-colors hover:border-background-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200";

export default function Search() {
  const { members } = useAppData();
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState("any");
  const [country, setCountry] = useState("any");
  const [county, setCounty] = useState("any");
  const [estate, setEstate] = useState("");

  const directory = members;

  const countries = useMemo(
    () => Array.from(new Set(directory.map((u) => u.country))).sort(),
    [directory],
  );

  const counties = useMemo(() => {
    const pool = country === "any" ? directory : directory.filter((u) => u.country === country);
    return Array.from(new Set(pool.map((u) => u.county))).sort();
  }, [directory, country]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const e = estate.trim().toLowerCase();
    return directory
      .filter((u) => (gender === "any" ? true : u.gender === gender))
      .filter((u) => (country === "any" ? true : u.country === country))
      .filter((u) => (county === "any" ? true : u.county === county))
      .filter((u) => (e ? u.estate.toLowerCase().includes(e) : true))
      .filter((u) =>
        q
          ? u.name.toLowerCase().includes(q) ||
            u.username.toLowerCase().includes(q) ||
            u.bio.toLowerCase().includes(q)
          : true,
      )
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [directory, query, gender, country, county, estate]);

  const activeFilters =
    gender !== "any" || country !== "any" || county !== "any" || estate.trim() !== "";

  const reset = () => {
    setGender("any");
    setCountry("any");
    setCounty("any");
    setEstate("");
  };

  return (
    <>
      <TopBar title="Search" />

      <div className="mx-auto w-full max-w-[936px] lg:border-x lg:border-background-200/70">
        <div className="border-b border-background-200/70 bg-gradient-to-br from-primary-50 to-accent-50 px-4 py-5">
          <h1 className="font-heading text-xl font-semibold text-foreground-950">
            Find someone who fits
          </h1>
          <p className="mt-1 max-w-xl text-sm text-foreground-700">
            Search verified members by gender and location — country, county and estate. Exact addresses are
            never shared.
          </p>
        </div>

        <div className="px-4 py-4">
          <div className="flex items-center gap-2 rounded-lg bg-background-100 px-3 py-2.5">
            <i className="ri-search-line text-lg text-foreground-500" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, username or interests"
              className="w-full bg-transparent text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none"
            />
            {query ? (
              <button type="button" aria-label="Clear search" onClick={() => setQuery("")}>
                <i className="ri-close-circle-fill text-lg text-foreground-400" />
              </button>
            ) : null}
          </div>

          <div className="mt-3 flex rounded-full bg-background-200/70 px-1 py-1">
            {genderOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setGender(option.key)}
                className={`flex-1 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                  gender === option.key
                    ? "bg-background-50 text-foreground-950"
                    : "text-foreground-600"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-foreground-600">
                Country
              </span>
              <span className="relative block">
                <select
                  value={country}
                  onChange={(event) => {
                    setCountry(event.target.value);
                    setCounty("any");
                  }}
                  className={selectClass}
                >
                  <option value="any">All countries</option>
                  {countries.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <i className="ri-arrow-down-s-line pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-lg text-foreground-400" />
              </span>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-foreground-600">
                County / Region
              </span>
              <span className="relative block">
                <select
                  value={county}
                  onChange={(event) => setCounty(event.target.value)}
                  className={selectClass}
                >
                  <option value="any">All counties</option>
                  {counties.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <i className="ri-arrow-down-s-line pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-lg text-foreground-400" />
              </span>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-foreground-600">
                Estate
              </span>
              <span className="relative flex items-center">
                <i className="ri-map-pin-2-line pointer-events-none absolute left-3 text-base text-foreground-400" />
                <input
                  value={estate}
                  onChange={(event) => setEstate(event.target.value)}
                  placeholder="e.g. Kilimani"
                  className={`${selectClass} pl-9`}
                />
              </span>
            </label>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-foreground-600">
              <strong className="text-foreground-950">{results.length}</strong>{" "}
              {results.length === 1 ? "person" : "people"} found
            </p>
            {activeFilters ? (
              <button
                type="button"
                onClick={reset}
                className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
              >
                <i className="ri-refresh-line" />
                Reset filters
              </button>
            ) : null}
          </div>
        </div>

        {results.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-20 text-center">
            <i className="ri-user-search-line text-4xl text-foreground-400" />
            <p className="text-sm text-foreground-600">
              No one matches those filters yet. Try widening your search.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-background-200/70 border-t border-background-200/70">
            {results.map((user) => (
              <li key={user.id}>
                <Link
                  to={`/u/${user.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-background-100"
                >
                  <span className="relative h-14 w-14 shrink-0">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-full w-full rounded-full object-cover object-top"
                    />
                    {user.online ? (
                      <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-background-50 bg-secondary-500" />
                    ) : null}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="truncate text-sm font-semibold text-foreground-950">
                        {user.name}
                      </span>
                      <i className="ri-verified-badge-fill shrink-0 text-primary-500" />
                      <span className="flex items-center gap-1 rounded-full bg-secondary-100 px-1.5 py-0.5 text-[10px] font-medium text-secondary-800">
                        <i className={user.gender === "woman" ? "ri-women-line" : "ri-men-line"} />
                        {user.gender === "woman" ? "Woman" : "Man"}
                      </span>
                    </span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-xs text-foreground-500">
                      <i className="ri-map-pin-2-line" />
                      {user.estate}, {user.county} · {user.country}
                    </span>
                    <span className="mt-1 block truncate text-xs text-foreground-600">{user.bio}</span>
                  </span>

                  <span className="flex shrink-0 items-center gap-1 text-right">
                    <span className="text-[11px] font-medium text-foreground-600">
                      {distanceLabel(user.distanceKm)}
                    </span>
                    <i className="ri-arrow-right-s-line text-lg text-foreground-400" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <p className="px-4 py-6 text-center text-[11px] text-foreground-400">
          Area-level location only · Meetups happen at Heramio-verified hotels
        </p>
      </div>
    </>
  );
}