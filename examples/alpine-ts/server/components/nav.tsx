import { dataAttr } from "@zag-js/dom-query"
import { componentRoutesData } from "@zag-js/shared"

export function Nav({ currentComponent }: { currentComponent: string }) {
  return (
    <aside class="nav">
      <header>Zagjs</header>
      {componentRoutesData.map((component) => {
        const active = currentComponent === component.slug
        return (
          <a data-active={dataAttr(active)} href={`/${component.slug}`}>
            {component.label}
          </a>
        )
      })}
    </aside>
  )
}
