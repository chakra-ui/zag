import React from "react"
import ReactDOM from "react-dom/client"
import "./index.css"
import { Menu } from "./Menu"
;(function () {
  document.getElementById("shadow-root")?.attachShadow({ mode: "open" })
})()

const MenuGroup = (props: any) => (
  <div className="menu-group" {...props}>
    <Menu id="1" />
    <Menu id="2" />
    <Menu id="3" />
    <Menu id="4" />
    <Menu id="5" />
  </div>
)

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <h3>Normal Root</h3>
    <MenuGroup />
  </React.StrictMode>,
)

ReactDOM.createRoot(document.getElementById("shadow-root")?.shadowRoot as DocumentFragment).render(
  <React.StrictMode>
    <h3>Shadow root</h3>
    <MenuGroup part="menu-group" />
  </React.StrictMode>,
)
