import { RouterView, RouterLink, useRouter } from "vue-router"
import { h, Fragment } from "vue"
import { navStyle, pageStyle } from "../../../shared/style"
import { injectGlobal } from "@emotion/css"
import { dataAttr } from "@zag-js/dom-utils"

injectGlobal`
  body {
    margin: 0px;
  }
`

export default function App() {
  const router = useRouter()

  let currentRoute = router.currentRoute.value.name

  return (
    <div class={pageStyle}>
      <aside class={navStyle}>
        <header>Zagjs</header>
        {ITEMS.map((navItem) => {
          const active = currentRoute === navItem.path
          return (
            <RouterLink data-active={dataAttr(active)} to={`/${navItem.path}`} key={navItem.label}>
              {navItem.label}
            </RouterLink>
          )
        })}
      </aside>
      <RouterView />
    </div>
  )
}

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
