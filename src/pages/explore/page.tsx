import { useState } from "react";
import TopBar from "@/components/feature/TopBar";
import { exploreItems } from "@/lib/content";
import type { ExploreItem } from "@/lib/types";

const chips = ["All", "Coffee", "Dinner", "Music", "Picnic", "Vinyl"];

export default function Explore() {
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState("All");
  const [preview, setPreview] = useState<ExploreItem | null>(null);

  const filtered = exploreItems.filter((item) => {
    const matchesQuery = item.label.toLowerCase().includes(query.trim().toLowerCase());
    const matchesChip = chip === "All" || item.label.toLowerCase().includes(chip.toLowerCase());
    return matchesQuery && matchesChip;
  });

  return (
    <>
      <TopBar title="Explore" />

      <div className="mx-auto w-full max-w-[935px] lg:border-x lg:border-background-200/70">
        <div className="sticky top-14 z-30 border-b border-background-200/70 bg-background-50/95 px-4 py-3 backdrop-blur-md lg:top-0">
          <div className="flex items-center gap-2 rounded-lg bg-background-100 px-3 py-2.5">
            <i className="ri-search-line text-lg text-foreground-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people, interests, moments"
              className="w-full bg-transparent text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none"
            />
            {query ? (
              <button type="button" aria-label="Clear search" onClick={() => setQuery("")}>
                <i className="ri-close-circle-fill text-lg text-foreground-400" />
              </button>
            ) : null}
          </div>

          <ul className="mt-3 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {chips.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => setChip(item)}
                  className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                    chip === item
                      ? "bg-foreground-950 text-background-50"
                      : "bg-background-200/70 text-foreground-700"
                  }`}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-4 py-24 text-center">
            <i className="ri-search-eye-line text-4xl text-foreground-400" />
            <p className="text-sm text-foreground-600">No results. Try a different search.</p>
          </div>
        ) : (
          <div className="columns-2 gap-1 p-1 md:columns-3">
            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPreview(item)}
                className="group relative mb-1 block w-full break-inside-avoid overflow-hidden rounded-sm"
              >
                <img
                  src={item.image}
                  alt={item.label}
                  title={item.label}
                  className={`w-full object-cover object-top ${item.tall ? "aspect-[4/5]" : "aspect-square"}`}
                />
                <span className="absolute inset-0 flex items-end bg-foreground-950/0 p-3 opacity-0 transition-all group-hover:bg-foreground-950/40 group-hover:opacity-100">
                  <span className="text-xs font-medium text-background-50">{item.label}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {preview ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground-950/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-background-50">
            <div className="aspect-square w-full overflow-hidden">
              <img
                src={preview.image}
                alt={preview.label}
                title={preview.label}
                className="h-full w-full object-cover object-top"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <p className="font-heading text-lg font-semibold text-foreground-950">
                  {preview.label}
                </p>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setPreview(null)}
                  className="flex h-8 w-8 items-center justify-center text-foreground-600"
                >
                  <i className="ri-close-line text-2xl" />
                </button>
              </div>
              <p className="mt-1 text-sm text-foreground-600">
                From the Heramio community · verified members only
              </p>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  className="flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2.5 text-sm font-semibold text-background-50"
                >
                  <i className="ri-heart-3-line" />
                  Like
                </button>
                <button
                  type="button"
                  className="flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-background-300 px-4 py-2.5 text-sm font-semibold text-foreground-800"
                >
                  <i className="ri-chat-3-line" />
                  Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}