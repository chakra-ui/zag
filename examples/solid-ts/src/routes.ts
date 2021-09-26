import type { RouteDefinition } from "solid-app-router"
import { lazy } from "solid-js"

import Home from "./pages/home"

export const routes: RouteDefinition[] = [
  {
    path: "/",
    component: Home,
  },
  {
    path: "/accordion",
    component: lazy(() => import("./pages/accordion")),
  },
  {
    path: "/combobox",
    component: lazy(() => import("./pages/combobox")),
  },
  {
    path: "/editable",
    component: lazy(() => import("./pages/editable")),
  },
  {
    path: "/menu",
    component: lazy(() => import("./pages/menu")),
  },
  {
    path: "/number-input",
    component: lazy(() => import("./pages/number-input")),
  },
  {
    path: "**",
    component: lazy(() => import("./errors/404")),
  },
]
