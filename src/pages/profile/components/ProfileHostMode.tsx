import { useNavigate } from "react-router-dom";
import { useAppData } from "@/store/AppDataProvider";

export default function ProfileHostMode() {
  const { role, setRole } = useAppData();
  const navigate = useNavigate();
  const isHost = role === "host";

  const handleClick = async () => {
    if (!isHost) await setRole("host");
    navigate("/host");
  };

  return (
    <section className="border-b border-background-200/70 px-4 py-5">
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-background-200/80 bg-gradient-to-br from-secondary-50 to-background-50 p-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary-500 text-background-50">
          <i className={isHost ? "ri-store-3-line text-xl" : "ri-hotel-line text-xl"} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-base font-semibold text-foreground-950">
            {isHost ? "You're a host" : "Own a hotel or Airbnb?"}
          </h3>
          <p className="mt-0.5 text-xs text-foreground-600">
            {isHost
              ? "Manage your listings, track bookings and withdraw your earnings."
              : "List your place on Heramio and get paid after every check-in."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isHost ? (
            <button
              type="button"
              onClick={() => setRole("dater")}
              className="cursor-pointer whitespace-nowrap rounded-md border border-background-300 px-4 py-2 text-xs font-semibold text-foreground-700"
            >
              Switch to dating
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleClick}
            className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-xs font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            <i className={isHost ? "ri-dashboard-3-line" : "ri-add-line"} />
            {isHost ? "Host dashboard" : "Become a host"}
          </button>
        </div>
      </div>
    </section>
  );
}