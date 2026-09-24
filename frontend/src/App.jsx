import { lazy, Suspense, useEffect } from "react";
import { createBrowserRouter, Navigate, Outlet, RouterProvider, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AppLayout } from "./components/layout/Layout";
import { Spinner } from "./components/ui";
import { useAuth } from "./context/AuthContext";
import { LoginPage, RegisterPage } from "./pages/AuthPages";

const page = (name) => lazy(() => import("./pages/Pages").then((module) => ({ default: module[name] })));
const HomePage = page("HomePage"); const ResultsPage = page("ResultsPage"); const WatchPage = page("WatchPage"); const UploadPage = page("UploadPage"); const StudioPage = page("StudioPage"); const ChannelPage = page("ChannelPage"); const HistoryPage = page("HistoryPage"); const LikedPage = page("LikedPage"); const SubscriptionsPage = page("SubscriptionsPage"); const PlaylistsPage = page("PlaylistsPage"); const PlaylistDetailPage = page("PlaylistDetailPage"); const SettingsPage = page("SettingsPage"); const CommunityPage = page("CommunityPage"); const NotFoundPage = page("NotFoundPage");
function LoadingScreen() { return <div className="splash"><div className="splash-brand"><span className="brand-mark"><span className="splash-play"/></span>vid<span>tube</span></div><Spinner/><p>Getting your world ready</p></div>; }
function ProtectedRoute() { const { user, loading } = useAuth(); const location = useLocation(); if (loading) return <LoadingScreen/>; return user ? <Outlet/> : <Navigate to="/login" replace state={{ from: location.pathname + location.search }}/>; }
function GuestRoute({ children }) { const { user, loading } = useAuth(); const location = useLocation(); useEffect(() => { document.title = `${location.pathname === "/login" ? "Sign in" : "Create account"} | Vidtube`; }, [location.pathname]); if (loading) return <LoadingScreen/>; return user ? <Navigate to={location.state?.from || "/"} replace/> : children; }
function PageSuspense({ children }) { return <Suspense fallback={<div className="route-loading"><Spinner/></div>}>{children}</Suspense>; }
function TitleSync() { const location = useLocation(); useEffect(() => { const slug = location.pathname.split("/").filter(Boolean).pop(); document.title = `${slug ? slug.replaceAll("-", " ").replace(/^./, (c) => c.toUpperCase()) : "Discover"} · Vidtube`; }, [location.pathname]); return null; }
function ProtectedLayout() { return <><TitleSync/><ProtectedRoute/></>; }
const router = createBrowserRouter([
  { path: "/login", element: <GuestRoute><LoginPage/></GuestRoute> },
  { path: "/register", element: <GuestRoute><RegisterPage/></GuestRoute> },
  { element: <ProtectedLayout/>, children: [{ element: <AppLayout><PageSuspense><Outlet/></PageSuspense></AppLayout>, children: [
    { index: true, element: <HomePage/> },
    { path: "results", element: <ResultsPage/> },
    { path: "watch/:videoId", element: <WatchPage/> },
    { path: "upload", element: <UploadPage/> },
    { path: "studio", element: <StudioPage/> },
    { path: "channel/:username", element: <ChannelPage/> },
    { path: "history", element: <HistoryPage/> },
    { path: "liked", element: <LikedPage/> },
    { path: "subscriptions", element: <SubscriptionsPage/> },
    { path: "playlists", element: <PlaylistsPage/> },
    { path: "playlist/:playlistId", element: <PlaylistDetailPage/> },
    { path: "settings", element: <SettingsPage/> },
    { path: "community", element: <CommunityPage/> },
    { path: "*", element: <NotFoundPage/> }
  ]}] }
]);
export default function App() { const client = useQueryClient(); useEffect(() => { const sync = () => client.setQueryData(["currentUser"], null); window.addEventListener("vidtube:unauthorized", sync); return () => window.removeEventListener("vidtube:unauthorized", sync); }, [client]); return <><RouterProvider router={router}/><Toaster position="top-right" toastOptions={{ duration: 3500 }} containerStyle={{ zIndex: 70 }}/></>; }
