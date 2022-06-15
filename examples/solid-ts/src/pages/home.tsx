import { routesData } from "@zag-js/shared"
import { Link } from "solid-app-router"
import { For } from "solid-js/web"

export default function Home() {
  return (
    <div className="index-nav">
      <h2>Zag.js + Solid</h2>
      <ul>
        <For each={routesData}>
          {(route) => (
            <li>
              <Link href={route.path}>{route.label}</Link>
            </li>
          )}
        </For>
      </ul>
    </div>
  )
}
