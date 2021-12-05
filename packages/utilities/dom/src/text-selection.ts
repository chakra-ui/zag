import { nextTick } from "./next-tick"

type State = "default" | "disabled" | "restoring"

let state: State = "default"
let cache = ""

export function disableTextSelection(ownerDocument: Document) {
  const doc = ownerDocument || document
  const root = doc.documentElement

  if (state === "default") {
    cache = root.style.userSelect
    root.style.userSelect = "none"
  }
  state = "disabled"

  return function restoreTextSelection() {
    if (state !== "disabled") return
    state = "restoring"
    nextTick(() => {
      if (state === "restoring") {
        if (root.style.userSelect === "none") {
          root.style.userSelect = cache || ""
        }
        cache = ""
        state = "default"
      }
    })
  }
}
