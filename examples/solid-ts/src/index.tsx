import { render } from "solid-js/web"
import { Router, Route } from "@solidjs/router"
import App from "./app"
import { routes } from "./routes"
import { For } from "solid-js"

render(
  () => (
    <Router root={App}>
      <For each={routes}>{(route) => <Route path={route.path} component={route.component} />}</For>
    </Router>
  ),
  document.getElementById("root")!,
)
