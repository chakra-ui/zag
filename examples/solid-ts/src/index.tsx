import "../../../shared/reset"
import { render } from "solid-js/web"
import { Router } from "solid-app-router"
import App from "./app"
import "regenerator-runtime/runtime"

render(
  () => (
    <Router>
      <App />
    </Router>
  ),
  document.getElementById("root"),
)
