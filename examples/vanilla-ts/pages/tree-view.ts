import "../../../shared/src/css/keyframes.module.css"
import "../../../shared/src/css/layout.module.css"
import "../../../shared/src/css/tree-view.module.css"

import { nanoid } from "nanoid"
import { TreeView } from "../src/tree-view"

document.querySelectorAll<HTMLElement>(".tree-view").forEach((rootEl) => {
  const treeView = new TreeView(rootEl, {
    id: nanoid(),
  })

  treeView.init()
})
