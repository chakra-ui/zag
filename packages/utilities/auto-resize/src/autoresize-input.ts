import { getDocument, getWindow } from "@zag-js/dom-query"
import { getVisualStyles } from "./visual-style"

function createGhostElement(doc: Document) {
  var el = doc.createElement("div")
  el.id = "ghost"
  el.style.cssText =
    "display:inline-block;height:0;overflow:hidden;position:absolute;top:0;visibility:hidden;white-space:nowrap;"
  doc.body.appendChild(el)
  return el
}

export function autoResizeInput(input: HTMLInputElement | null) {
  if (!input) return

  const doc = getDocument(input)
  const win = getWindow(input)

  const ghost = createGhostElement(doc)

  const cssText = getVisualStyles(input)
  if (cssText) ghost.style.cssText += cssText

  function resize() {
    win.requestAnimationFrame(() => {
      ghost.innerHTML = input!.value
      const rect = win.getComputedStyle(ghost)
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
