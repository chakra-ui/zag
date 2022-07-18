import { routesData } from "@zag-js/shared"
import { createRouter, createWebHistory } from "vue-router"
import Home from "./pages/index"

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: Home,
    },
    ...routesData.map((route) => ({
      path: route.path,
      component: () => import(`./pages${route.path}`),
    })),
  ],
})
