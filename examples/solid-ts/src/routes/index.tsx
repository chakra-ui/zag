import { componentRoutesData } from "@zag-js/shared"
import { A } from "@solidjs/router"
import { For } from "solid-js/web"

export default function Home() {
  return (
    <div class="index-nav">
      <h2>Zag.js + Solid</h2>
      <ul>
        <For each={componentRoutesData}>
          {(component) => (
            <li>
              <A href={`/${component.slug}`}>{component.label}</A>
            </li>
          )}
        </For>
      </ul>
    </div>
  )
}
