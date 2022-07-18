import { routesData } from "@zag-js/shared"
import { RouteDefinition } from "solid-app-router"
import { lazy } from "solid-js"

import Home from "./pages/home"

export const routes: RouteDefinition[] = [
  {
    path: "/",
    component: Home,
  },
  ...routesData.map((route) => ({
    path: route.path,
    component: lazy(() => import(`./pages${route.path}`)),
  })),
  {
    path: "**",
    component: lazy(() => import("./errors/404")),
  },
]
