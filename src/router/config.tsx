import type { RouteObject } from "react-router-dom";
import AppLayout from "@/components/feature/AppLayout";
import AuthGuard from "@/components/feature/AuthGuard";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/home/page";
import Nearby from "@/pages/nearby/page";
import Events from "@/pages/events/page";
import Stays from "@/pages/stays/page";
import StayDetail from "@/pages/stays/detail/page";
import Explore from "@/pages/explore/page";
import Search from "@/pages/search/page";
import Create from "@/pages/create/page";
import Activity from "@/pages/activity/page";
import Profile from "@/pages/profile/page";
import Onboarding from "@/pages/onboarding/page";
import HostDashboard from "@/pages/host/page";
import Trips from "@/pages/trips/page";
import Settings from "@/pages/settings/page";
import Messages from "@/pages/messages/page";
import Chat from "@/pages/messages/chat/page";
import UserProfile from "@/pages/user/page";
import Login from "@/pages/auth/login/page";
import Register from "@/pages/auth/register/page";
import ForgotPassword from "@/pages/auth/forgot-password/page";
import ResetPassword from "@/pages/auth/reset-password/page";
import AuthCallback from "@/pages/auth/callback/page";

const routes: RouteObject[] = [
  { path: "/auth/login", element: <Login /> },
  { path: "/auth/register", element: <Register /> },
  { path: "/auth/forgot-password", element: <ForgotPassword /> },
  { path: "/auth/reset-password", element: <ResetPassword /> },
  { path: "/auth/callback", element: <AuthCallback /> },
  {
    path: "/",
    element: <AuthGuard />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Home /> },
          { path: "search", element: <Search /> },
          { path: "nearby", element: <Nearby /> },
          { path: "events", element: <Events /> },
          { path: "stays", element: <Stays /> },
          { path: "stays/:id", element: <StayDetail /> },
          { path: "explore", element: <Explore /> },
          { path: "create", element: <Create /> },
          { path: "activity", element: <Activity /> },
          { path: "profile", element: <Profile /> },
          { path: "trips", element: <Trips /> },
          { path: "settings", element: <Settings /> },
          { path: "host", element: <HostDashboard /> },
          { path: "onboarding", element: <Onboarding /> },
          { path: "messages", element: <Messages /> },
          { path: "messages/:id", element: <Chat /> },
          { path: "u/:id", element: <UserProfile /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;