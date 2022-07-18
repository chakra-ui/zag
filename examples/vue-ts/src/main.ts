import { resetCss } from "@zag-js/shared"
import { createApp } from "vue"
import App from "./App"
import { router } from "./routes"

resetCss()

createApp(App).use(router).mount("#app")
