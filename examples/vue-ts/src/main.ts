import { createApp } from "vue"
import App from "./App"
import { createRouter, createWebHistory } from "vue-router"
import routes from "pages-generated"
import "../../../shared/reset"

const router = createRouter({
  history: createWebHistory(),
  routes,
})

createApp(App).use(router).mount("#app")
