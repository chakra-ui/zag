import { render } from "preact"
import { LocationProvider, Route, Router } from "preact-iso"
import "@styles/global.css"
import "@styles/playground.css"
import { prefsScript } from "./components/shell/prefs"
import { Shell } from "./components/shell/shell"
import { NotFound } from "./pages/_404.jsx"
import { routes } from "./routes"

// Sets saved shell prefs on <html> before first paint
const prefs = document.createElement("script")
prefs.textContent = prefsScript
document.head.appendChild(prefs)

// e2e waits for this before interacting
const markReady = () => {
  document.documentElement.dataset.ready = ""
}

export function App() {
  return (
    <Shell>
      <Router onLoadEnd={markReady} onRouteChange={markReady}>
        {routes.map((route, index) => (
          <route.component key={index} path={route.path} />
        ))}
        <Route default component={NotFound} />
      </Router>
    </Shell>
  )
}

render(
  <LocationProvider>
    <App />
  </LocationProvider>,
  document.getElementById("app")!,
)
