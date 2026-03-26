import { MetaProvider, Title } from "@solidjs/meta"
import { A, Router, useLocation } from "@solidjs/router"
import { FileRoutes } from "@solidjs/start/router"
import { dataAttr } from "@zag-js/dom-query"
import { componentRoutesData, getComponentByPath, isKnownComponent } from "@zag-js/shared"
import "../../shared/styles/style.module.css"
import "./app.module.css"
import { For, Suspense } from "solid-js"

export default function App() {
  return (
    <div class="page">
      <Router
        preload
        root={(props) => {
          const location = useLocation()
          const currentComponent = () => {
            const pathname = location.pathname.split("?")[0] || "/"
            const pathnameComponent = pathname.split("/").filter(Boolean)[0] ?? ""
            return getComponentByPath(pathname) ?? (isKnownComponent(pathnameComponent) ? pathnameComponent : "")
          }

          return (
            <MetaProvider>
              <Title>Zag.js + Solid</Title>
              <aside class="nav">
                <header>Zagjs</header>
                <For each={componentRoutesData} fallback={<div>Loading...</div>}>
                  {(component) => (
                    <A data-active={dataAttr(currentComponent() === component.slug)} href={`/${component.slug}`}>
                      {component.label}
                    </A>
                  )}
                </For>
              </aside>
              <Suspense>{props.children}</Suspense>
            </MetaProvider>
          )
        }}
      >
        <FileRoutes />
      </Router>
    </div>
  )
}
