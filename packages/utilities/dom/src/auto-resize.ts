import { copyVisualStyles } from "./computed-style"
import { raf } from "./next-tick"

function createGhostElement(doc: Document) {
  var el = doc.createElement("div")
  el.id = "ghost"
  el.style.cssText =
    "display:inline-block;height:0;overflow:hidden;position:absolute;top:0;visibility:hidden;white-space:nowrap;"
  doc.body.appendChild(el)
  return el
}

export function autoresizeInput(input: HTMLInputElement | null) {
  if (!input) return
  const doc = input.ownerDocument ?? document
  const ghost = createGhostElement(doc)

  copyVisualStyles(input, ghost)

  function resize() {
    raf(() => {
      ghost.innerHTML = input!.value
      const rect = getComputedStyle(ghost)
      input?.style.setProperty("width", rect.width)
    })
  }

  resize()

  input?.addEventListener("input", resize)
  input?.addEventListener("change", resize)

  return () => {
    doc.body.removeChild(ghost)
    input?.removeEventListener("input", resize)
    input?.removeEventListener("change", resize)
  }
}
