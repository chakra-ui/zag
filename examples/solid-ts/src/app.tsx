import { A, useMatch } from "@solidjs/router"
import { dataAttr } from "@zag-js/dom-query"
import { routesData } from "@zag-js/shared"
import { Component, For } from "solid-js"
import "../../../shared/src/style.css"

const App: Component = (props: any) => {
  return (
    <div class="page">
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
      {props.children}
    </div>
  )
}

export default App
