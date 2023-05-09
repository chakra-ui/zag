import { render } from "solid-js/web"
import { Router } from "@solidjs/router"
import App from "./app"

render(
  () => (
    <Router>
      <App />
    </Router>
  ),
  document.getElementById("root")!,
)
