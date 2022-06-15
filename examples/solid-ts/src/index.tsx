import { resetCss } from "@zag-js/shared"
import { render } from "solid-js/web"
import { Router } from "solid-app-router"
import App from "./app"

resetCss()

render(
  () => (
    <Router>
      <App />
    </Router>
  ),
  document.getElementById("root"),
)
