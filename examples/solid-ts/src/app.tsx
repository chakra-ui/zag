import { Link, useMatch, useRoutes } from "solid-app-router"
import { Component, For } from "solid-js"
import { navStyle, pageStyle } from "../../../shared/style"
import { routes } from "./routes"
import { dataAttr } from "@zag-js/dom-utils"

const App: Component = () => {
  const Route = useRoutes(routes)

  return (
    <div className={pageStyle}>
      <aside className={navStyle}>
        <header>Zagjs</header>
        <For each={ITEMS} fallback={<div>Loading...</div>}>
          {(item) => {
            const match = useMatch(() => item.path)
            return (
              <Link data-active={dataAttr(!!match())} href={`/${item.path}`}>
                {item.label}
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

const ITEMS = [
  { label: "Accordion", path: "accordion" },
  { label: "Combobox", path: "combobox" },
  { label: "Editable", path: "editable" },
  { label: "Dialog", path: "dialog" },
  { label: "Menu", path: "menu" },
  { label: "Nested Menu", path: "nested-menu" },
  { label: "Menu With options", path: "menu-options" },
  { label: "Context Menu", path: "context-menu" },
  { label: "Number Input", path: "number-input" },
  { label: "Pin Input", path: "pin-input" },
  { label: "Popover", path: "popover" },
  { label: "Range Slider", path: "range-slider" },
  { label: "Rating", path: "rating" },
  { label: "Slider", path: "slider" },
  { label: "Tabs", path: "tabs" },
  { label: "Tags Input", path: "tags-input" },
  { label: "Toast", path: "toast" },
  { label: "Tooltip", path: "tooltip" },
  { label: "Splitter", path: "splitter" },
]
