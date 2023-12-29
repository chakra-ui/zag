import { dataAttr } from "@zag-js/dom-query"
import { routesData } from "@zag-js/shared"
import { render } from "preact"
import { LocationProvider, Route, Router, useLocation } from "preact-iso"
import "../../../shared/src/style.css"
import { NotFound } from "./pages/_404.jsx"
import { routes } from "./routes"

export function App() {
  const location = useLocation()
  return (
    <div className="page">
      <aside class="nav">
        <header>Zagjs</header>
        {routesData
          .sort((a, b) => a.label.localeCompare(b.label))
          .map((route) => (
            <a data-active={dataAttr(location.path === route.path)} href={route.path}>
              {route.label}
            </a>
          ))}
      </aside>
      <Router>
        {(routes as any).map((route, index) => (
          <route.component key={index} path={route.path} />
        ))}
        <Route default component={NotFound} />
      </Router>
    </div>
  )
}

render(
  <LocationProvider>
    <App />
  </LocationProvider>,
  document.getElementById("app"),
)
