import { addDomEvent } from "@zag-js/dom-query"
import { layerStack } from "./layer-stack"

const listeners = new WeakMap<Document, { count: number; cleanup: VoidFunction }>()

export function trackLayerEscape(doc: Document) {
  // Each subscription releases at most once
  let released = false
  const releaseOnce = () => {
    if (released) return
    released = true
    release(doc)
  }

  const existing = listeners.get(doc)
  if (existing) {
    existing.count++
    return releaseOnce
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return
    if (event.isComposing) return
    // Select once: synchronous cleanup must not deliver this Escape to the parent too.
    const layer = layerStack.topMost(doc)
    layer?.onEscapeKeyDown?.(event)
  }

  const cleanup = addDomEvent(doc, "keydown", handleKeyDown, { capture: true })
  listeners.set(doc, { count: 1, cleanup })
  return releaseOnce
}

function release(doc: Document) {
  const entry = listeners.get(doc)
  if (!entry || --entry.count > 0) return
  entry.cleanup()
  listeners.delete(doc)
}
