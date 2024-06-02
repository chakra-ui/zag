import { MetaProvider, Title } from "@solidjs/meta"
import { A, Router, useMatch } from "@solidjs/router"
import { FileRoutes } from "@solidjs/start/router"
import { dataAttr } from "@zag-js/dom-query"
import { routesData } from "@zag-js/shared"
import "@zag-js/shared/src/style.css"
import { For, Suspense } from "solid-js"

export default function App() {
  return (
    <div class="page">
      <Router
        preload
        root={(props) => (
          <MetaProvider>
            <Title>Zag.js + Solid</Title>
            <aside class="nav">
              <header>Zagjs</header>
              <For each={routesData.sort((a, b) => a.label.localeCompare(b.label))} fallback={<div>Loading...</div>}>
                {(route) => {
                  const match = useMatch(() => route.path)
                  return (
                    <A data-active={dataAttr(!!match())} href={route.path}>
                      {route.label}
                    </A>
                  )
                }}
              </For>
            </aside>
            <Suspense>{props.children}</Suspense>
          </MetaProvider>
        )}
      >
        <FileRoutes />
      </Router>
    </div>
  )
}
