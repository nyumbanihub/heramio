import { Outlet } from "react-router-dom";
import DesktopRail from "@/components/feature/DesktopRail";
import BottomNav from "@/components/feature/BottomNav";

export default function AppLayout() {
  return (
    <div className="min-h-screen w-full bg-background-50">
      <DesktopRail />

      <div className="lg:pl-[76px] xl:pl-[248px]">
        <main className="min-h-screen pb-20 pt-14 lg:pb-10 lg:pt-0">
          <Outlet />
        </main>
      </div>

      <BottomNav />
    </div>
  );
}