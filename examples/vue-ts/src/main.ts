import { createApp } from "vue"
import App from "./App"
import { router } from "./routes"
import "../../../shared/src/style.css"

createApp(App).use(router).mount("#app")
