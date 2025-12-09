import { dataAttr } from "@zag-js/dom-query"
import { routesData } from "@zag-js/shared"

export function Nav({ pathname }: { pathname: string }) {
  return (
    <aside class="nav">
      <header>Zagjs</header>
      {routesData
        .sort((a, b) => a.label.localeCompare(b.label))
        .map((route) => {
          const active = pathname === route.path
          return (
            <a data-active={dataAttr(active)} href={route.path}>
              {route.label}
            </a>
          )
        })}
    </aside>
  )
}
