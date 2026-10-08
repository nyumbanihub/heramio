import { Link } from "react-router-dom";
import type { NearbyPerson } from "@/lib/types";
import { useAppData } from "@/store/AppDataProvider";

interface NearbyPersonRowProps {
  person: NearbyPerson;
  onMeet: (person: NearbyPerson) => void;
}

const formatDistance = (km: number): string => {
  if (km <= 0) return "You";
  if (km < 1) return `${Math.round(km * 1000)} m away`;
  if (km < 100) return `${km.toFixed(1)} km away`;
  return `${Math.round(km).toLocaleString()} km away`;
};

export default function NearbyPersonRow({ person, onMeet }: NearbyPersonRowProps) {
  const { getUser } = useAppData();
  const user = getUser(person.userId);
  if (!user) return null;

  return (
    <li className="flex items-center gap-3 py-3">
      <Link to={`/u/${user.id}`} className="relative shrink-0">
        <img
          src={user.avatar}
          alt={user.name}
          className="h-14 w-14 rounded-full object-cover object-top"
        />
        {person.online ? (
          <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background-50 bg-secondary-500" />
        ) : (
          <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background-50 bg-background-400" />
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 text-sm font-semibold text-foreground-950">
          <span className="truncate">{user.name}</span>
          {user.verified ? <i className="ri-verified-badge-fill text-primary-500" /> : null}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-foreground-600">
          <i className="ri-map-pin-2-line" />
          {person.estate} · {formatDistance(person.distanceKm)}
        </p>
        <p className={`mt-0.5 truncate text-[11px] ${person.online ? "font-medium text-secondary-700" : "text-foreground-400"}`}>
          {person.lastSeen} · “{person.intent}”
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Link
          to="/messages"
          aria-label={`Message ${user.name}`}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-background-300 text-foreground-700"
        >
          <i className="ri-chat-3-line" />
        </Link>
        <button
          type="button"
          onClick={() => onMeet(person)}
          className="whitespace-nowrap rounded-md bg-primary-500 px-3.5 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600"
        >
          Meet up
        </button>
      </div>
    </li>
  );
}