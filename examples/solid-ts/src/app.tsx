import { Link, useMatch, useRoutes } from "@solidjs/router"
import { dataAttr } from "@zag-js/dom-query"
import { routesData } from "@zag-js/shared"
import { Component, For } from "solid-js"
import "../../../shared/src/style.css"
import { routes } from "./routes"

const App: Component = () => {
  const Route = useRoutes(routes)

  return (
    <div class="page">
      <aside class="nav">
        <header>Zagjs</header>
        <For each={routesData.sort((a, b) => a.label.localeCompare(b.label))} fallback={<div>Loading...</div>}>
          {(route) => {
            const match = useMatch(() => route.path)
            return (
              <Link data-active={dataAttr(!!match())} href={route.path}>
                {route.label}
              </Link>
            )
          }}
        </For>
      </aside>
      <Route />
    </div>
  )
}

export default App
