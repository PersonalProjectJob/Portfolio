import { createBrowserRouter, Navigate } from "react-router";
import { RootLayout } from "./pages/RootLayout";
import { ChatPage } from "./pages/ChatPage";
import { JobsPage } from "./pages/JobsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { LandingPage } from "./pages/LandingPage";
import { LegalPage } from "./pages/LegalPage";
import { AdminPage } from "./pages/AdminPage";
import { AuthCallbackPage } from "./pages/AuthCallbackPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { createElement } from "react";

function SettingsRedirect() {
  return createElement(Navigate, { to: "/chat", replace: true });
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/projects",
    Component: ProjectsPage,
  },
  {
    path: "/projects/:projectId",
    Component: ProjectDetailPage,
  },
  {
    path: "/admin",
    Component: AdminPage,
  },
  {
    path: "/chat",
    Component: RootLayout,
    children: [
      { index: true, Component: ChatPage },
      { path: "jobs", Component: JobsPage },
      { path: "profile", Component: ProfilePage },
      { path: "settings", Component: SettingsRedirect },
    ],
  },
  /* Legal document pages (public, no auth required) */
  {
    path: "/privacy-policy",
    Component: LegalPage,
  },
  {
    path: "/terms-of-service",
    Component: LegalPage,
  },
  /* Email verification callback */
  {
    path: "/auth/callback",
    Component: AuthCallbackPage,
  },
]);