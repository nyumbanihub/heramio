import { Link } from "react-router-dom";
import TopBar from "@/components/feature/TopBar";
import { useAppData } from "@/store/AppDataProvider";

export default function NearbyPage() {
  const { nearby, getUser } = useAppData();

  const sorted = [...nearby].sort((a, b) => {
    if (a.online !== b.online) return a.online ? -1 : 1;
    return a.distanceKm - b.distanceKm;
  });

  return (
    <>
      <TopBar title="Nearby" />
      <div className="mx-auto w-full max-w-[935px] px-4 py-4 lg:border-x lg:border-background-200/70">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground-900">People close to you</h2>
          <span className="rounded-full bg-primary-50 px-2 py-1 text-[10px] font-medium text-primary-700">
            {sorted.length} nearby
          </span>
        </div>

        <ul className="space-y-3">
          {sorted.map((person) => {
            const user = getUser(person.userId);
            if (!user) return null;
            return (
              <li key={person.id} className="rounded-2xl border border-background-200 bg-background-50 p-3">
                <Link to={`/u/${user.id}`} className="flex items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-background-200">
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                    {person.online ? (
                      <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-background-50 bg-secondary-500" />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-foreground-950">{user.name}</p>
                      {user.verified ? <i className="ri-shield-check-fill text-sm text-primary-500" /> : null}
                    </div>
                    <p className="text-xs text-foreground-500">{user.city || user.country || "Nearby"}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-medium text-foreground-700">
                      {person.distanceKm < 1 ? `${Math.round(person.distanceKm * 1000)}m` : `${person.distanceKm.toFixed(1)}km`}
                    </p>
                    <p className="text-[10px] text-foreground-500">{person.online ? "Online now" : "Away"}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
