import { dataAttr } from "@zag-js/dom-query"
import { componentRoutesData, getComponentByPath, isKnownComponent } from "@zag-js/shared"
import { render } from "preact"
import { LocationProvider, Route, Router, useLocation } from "preact-iso"
import "@styles/global.css"
import { NotFound } from "./pages/_404.jsx"
import { routes } from "./routes"

export function App() {
  const location = useLocation()
  const pathname = location.path.split("?")[0] || "/"
  const pathnameComponent = pathname.split("/").filter(Boolean)[0] ?? ""
  const currentComponent =
    getComponentByPath(pathname) ?? (isKnownComponent(pathnameComponent) ? pathnameComponent : "")

  return (
    <div className="page">
      <aside class="nav">
        <header>Zagjs</header>
        {componentRoutesData.map((component) => (
          <a
            key={component.slug}
            data-active={dataAttr(currentComponent === component.slug)}
            href={`/${component.slug}`}
          >
            {component.label}
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
