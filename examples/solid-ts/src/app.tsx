import { dataAttr } from "@zag-js/dom-utils"
import { navStyle, pageStyle, routesData } from "@zag-js/shared"
import { Link, useMatch, useRoutes } from "solid-app-router"
import { Component, For } from "solid-js"
import { routes } from "./routes"

const App: Component = () => {
  const Route = useRoutes(routes)

  return (
    <div className={pageStyle}>
      <aside className={navStyle}>
        <header>Zagjs</header>
        <For each={routesData} fallback={<div>Loading...</div>}>
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
