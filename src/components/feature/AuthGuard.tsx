import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AppDataProvider } from "@/store/AppDataProvider";
import BrandLogo from "@/components/feature/BrandLogo";

export default function AuthGuard() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-background-100">
        <BrandLogo />
        <span className="flex items-center gap-2 text-xs font-medium text-foreground-500">
          <i className="ri-loader-4-line animate-spin text-base text-primary-500" />
          Loading Heramio
        </span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  return (
    <AppDataProvider>
      <Outlet />
    </AppDataProvider>
  );
}