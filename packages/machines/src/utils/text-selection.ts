type State = "default" | "disabled" | "restoring"

let state: State = "default"
let savedUserSelect = ""

export function disableTextSelection(ownerDocument: Document) {
  const doc = ownerDocument || document
  if (state === "default") {
    savedUserSelect = doc.documentElement.style.webkitUserSelect
    doc.documentElement.style.webkitUserSelect = "none"
  }
  state = "disabled"

  return function restoreTextSelection() {
    if (state !== "disabled") return
    state = "restoring"
    setTimeout(() => {
      requestAnimationFrame(() => {
        if (state === "restoring") {
          if (document.documentElement.style.webkitUserSelect === "none") {
            document.documentElement.style.webkitUserSelect = savedUserSelect || ""
          }
          savedUserSelect = ""
          state = "default"
        }
      })
    }, 300)
  }
}
