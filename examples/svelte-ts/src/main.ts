import "../../../shared/src/style.css"

import { createRoot } from "svelte"
import App from "./App.svelte"

const app = createRoot(App, {
  target: document.getElementById("app")!,
})

export default app
