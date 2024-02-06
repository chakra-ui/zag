import { routesData } from "@zag-js/shared"
import { A } from "@solidjs/router"
import { For } from "solid-js/web"

export default function Home() {
  return (
    <div class="index-nav">
      <h2>Zag.js + Solid</h2>
      <ul>
        <For each={routesData.sort((a, b) => a.label.localeCompare(b.label))}>
          {(route) => (
            <li>
              <A href={route.path}>{route.label}</A>
            </li>
          )}
        </For>
      </ul>
    </div>
  )
}
