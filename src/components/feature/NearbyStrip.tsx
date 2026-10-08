import { Link } from "react-router-dom";
import { useAppData } from "@/store/AppDataProvider";

const label = (km: number): string => {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 100) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
};

export default function NearbyStrip() {
  const { nearby, getUser } = useAppData();
  const sorted = [...nearby].sort((a, b) => {
    if (a.online !== b.online) return a.online ? -1 : 1;
    return a.distanceKm - b.distanceKm;
  });

  return (
    <div className="border-b border-background-200/70 bg-gradient-to-b from-primary-50/60 to-background-50 py-3">
      <div className="flex items-center justify-between px-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground-950">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-secondary-500" />
          </span>
          Online near you
        </h2>
        <Link to="/nearby" className="text-xs font-semibold text-primary-600">
          See all
        </Link>
      </div>

      <ul className="mt-3 flex gap-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <li className="flex w-[68px] shrink-0 flex-col items-center gap-1.5">
          <Link
            to="/nearby"
            className="flex h-16 w-16 items-center justify-center rounded-full border border-primary-300 bg-background-50 text-primary-600"
          >
            <i className="ri-radar-line text-2xl" />
          </Link>
          <span className="w-full truncate text-center text-[11px] font-medium text-primary-700">Near me</span>
        </li>

        {sorted.map((person) => {
          const user = getUser(person.userId);
          if (!user) return null;
          return (
            <li key={person.id} className="flex w-[68px] shrink-0 flex-col items-center gap-1.5">
              <Link to={`/u/${user.id}`} className="relative h-16 w-16 rounded-full p-[2px]">
                <span
                  className={`flex h-full w-full items-center justify-center rounded-full p-[2px] ${
                    person.online ? "bg-secondary-500" : "bg-background-300"
                  }`}
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-full w-full rounded-full border-2 border-background-50 object-cover object-top"
                  />
                </span>
                {person.online ? (
                  <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-background-50 bg-secondary-500" />
                ) : null}
              </Link>
              <span className="w-full truncate text-center text-[11px] font-medium text-foreground-800">
                {user.name.split(" ")[0]}
              </span>
              <span className="-mt-1 text-[10px] text-foreground-500">{label(person.distanceKm)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}