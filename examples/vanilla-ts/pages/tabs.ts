import "@zag-js/shared/src/style.css"

import { nanoid } from "nanoid"
import { Tabs } from "../src/tabs"

document.querySelectorAll<HTMLElement>(".tabs").forEach((rootEl) => {
  const tabs = new Tabs(rootEl, {
    id: nanoid(),
    defaultValue: "tab1",
  })

  tabs.init()
})
