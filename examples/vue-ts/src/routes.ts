import { routesData } from "@zag-js/shared"
import { createRouter, createWebHistory } from "vue-router"
import Home from "./pages/index"
import Radio from "./pages/radio"

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: Home,
    },
    { path: "/accordion", component: () => import("./pages/accordion") },
    { path: "/checkbox", component: () => import("./pages/checkbox") },
    { path: "/combobox", component: () => import("./pages/combobox") },
    { path: "/editable", component: () => import("./pages/editable") },
    { path: "/dialog", component: () => import("./pages/dialog") },
    { path: "/dialog-default-open", component: () => import("./pages/dialog-default-open") },
    { path: "/menu", component: () => import("./pages/menu") },
    { path: "/nested-menu", component: () => import("./pages/nested-menu") },
    { path: "/menu-options", component: () => import("./pages/menu-options") },
    { path: "/context-menu", component: () => import("./pages/context-menu") },
    { path: "/number-input", component: () => import("./pages/number-input") },
    { path: "/pin-input", component: () => import("./pages/pin-input") },
    // { path: "/popper", component: () => import("./pages/popper") },
    { path: "/popover", component: () => import("./pages/popover") },
    // { path: "/nested-popover", component: () => import("./pages/nested-popover") },
    { path: "/range-slider", component: () => import("./pages/range-slider") },
    { path: "/radio", component: () => import("./pages/radio") },
    { path: "/rating", component: () => import("./pages/rating") },
    { path: "/slider", component: () => import("./pages/slider") },
    { path: "/tabs", component: () => import("./pages/tabs") },
    { path: "/tags-input", component: () => import("./pages/tags-input") },
    { path: "/toast", component: () => import("./pages/toast") },
    { path: "/tooltip", component: () => import("./pages/tooltip") },
    { path: "/splitter", component: () => import("./pages/splitter") },
  ],
})
