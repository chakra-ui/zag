import "../../../shared/src/css/keyframes.module.css"
import "../../../shared/src/css/layout.module.css"
import "../../../shared/src/css/tabs.module.css"

import { nanoid } from "nanoid"
import { Tabs } from "../src/tabs"

document.querySelectorAll<HTMLElement>(".tabs").forEach((rootEl) => {
  const tabs = new Tabs(rootEl, {
    id: nanoid(),
    defaultValue: "tab1",
  })

  tabs.init()
})
