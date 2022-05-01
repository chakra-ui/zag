import { AppProps } from "next/app"
import Head from "next/head"
import Link from "next/link"
import { injectGlobal } from "@emotion/css"
import "../../../shared/reset"
import { navStyle, pageStyle } from "../../../shared/style"
import { dataAttr } from "@zag-js/dom-utils"

injectGlobal`
  body {
    margin: 0px;
  }
`
export default function App({ Component, pageProps, router }: AppProps) {
  return (
    <div className={pageStyle}>
      <Head>
        <title>React Machines</title>
      </Head>

      <aside className={navStyle}>
        <header>Zagjs</header>
        {ITEMS.map((navItem) => {
          const active = router.pathname === `/${navItem.path}`
          return (
            <Link href={navItem.path} key={navItem.label} passHref>
              <a data-active={dataAttr(active)}>{navItem.label}</a>
            </Link>
          )
        })}
      </aside>
      <Component {...pageProps} />
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
