type State = "default" | "disabled" | "restoring"

let state: State = "default"
let cache = ""

export function disableTextSelection(ownerDocument: Document) {
  const doc = ownerDocument || document
  const win = doc.defaultView || window

  if (state === "default") {
    cache = doc.documentElement.style.userSelect
    doc.documentElement.style.userSelect = "none"
  }
  state = "disabled"

  return function restoreTextSelection() {
    if (state !== "disabled") return
    state = "restoring"
    setTimeout(() => {
      win.requestAnimationFrame(() => {
        if (state === "restoring") {
          if (doc.documentElement.style.userSelect === "none") {
            doc.documentElement.style.userSelect = cache || ""
          }
          cache = ""
          state = "default"
        }
      })
    }, 300)
  }
}
