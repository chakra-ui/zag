import { hydrate, LocationProvider, prerender as ssr, Route, Router } from "preact-iso"
import "@styles/global.css"
import "@styles/playground.css"
import { prefsScript } from "./components/shell/prefs"
import { endHydration } from "./lib/navigation"
import { Shell } from "./components/shell/shell"
import { NotFound } from "./pages/_404.jsx"
import { routes } from "./routes"

// Prerendered pages get this in <head>
if (import.meta.env.DEV) {
  const prefs = document.createElement("script")
  prefs.textContent = prefsScript
  document.head.appendChild(prefs)
}

// e2e waits for this before interacting
const markReady = () => {
  endHydration()
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

// No `location` while prerendering
const Root = (props: { url?: string }) => (
  <LocationProvider {...props}>
    <App />
  </LocationProvider>
)

if (typeof window !== "undefined") hydrate(<Root />, document.getElementById("app")!)

export async function prerender(data: { url: string }) {
  const { html } = await ssr(<Root url={data.url} />)
  return {
    html,
    links: new Set(routes.map((route) => route.path).filter((path) => !path.includes(":"))),
    head: {
      elements: new Set([{ type: "script", props: { children: prefsScript } }]),
    },
  }
}
