import { Link } from "react-router-dom";
import TopBar from "@/components/feature/TopBar";
import ProfileHeader from "./components/ProfileHeader";
import ProfileHostMode from "./components/ProfileHostMode";
import ProfileVerification from "./components/ProfileVerification";
import ProfileWallet from "./components/ProfileWallet";
import ProfilePosts from "./components/ProfilePosts";

export default function Profile() {
  return (
    <>
      <TopBar title="Profile" />

      <div className="mx-auto w-full max-w-[936px] lg:border-x lg:border-background-200/70">
        <ProfileHeader />
        <div className="border-b border-background-200/70 px-4 py-4">
          <Link
            to="/trips"
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-background-200/80 bg-background-50 px-3.5 py-3 transition-colors hover:bg-background-100/60"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-100 text-accent-800">
              <i className="ri-suitcase-line text-lg" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-foreground-950">My trips</span>
              <span className="block text-xs text-foreground-500">View bookings you've made</span>
            </span>
            <i className="ri-arrow-right-s-line text-xl text-foreground-400" />
          </Link>
        </div>
        <ProfileHostMode />
        <ProfileVerification />
        <ProfileWallet />
        <ProfilePosts />
      </div>
    </>
  );
}
