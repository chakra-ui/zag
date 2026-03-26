import "@zag-js/shared/src/style.css"

import { nanoid } from "nanoid"
import { TreeView } from "../src/tree-view"

document.querySelectorAll<HTMLElement>(".tree-view").forEach((rootEl) => {
  const treeView = new TreeView(rootEl, {
    id: nanoid(),
  })

  treeView.init()
})
