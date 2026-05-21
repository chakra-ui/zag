import { addDomEvent, getDocument } from "@zag-js/dom-query"

const handledEvents = new WeakSet<KeyboardEvent>()
const listeners = new WeakMap<Document, { count: number; cleanup: VoidFunction }>()

function trackHandledEscapeKeydown(doc: Document) {
  const listener = listeners.get(doc)
  if (listener) {
    listener.count++
    return
  }

  const cleanup = addDomEvent(doc, "keydown", (event) => {
    if (event.key !== "Escape") return
    if (!handledEvents.has(event)) return
    event.stopPropagation()
  })

  listeners.set(doc, { count: 1, cleanup })
}

function releaseHandledEscapeKeydown(doc: Document) {
  const listener = listeners.get(doc)
  if (!listener) return

  listener.count--

  queueMicrotask(() => {
    if (listener.count > 0) return
    listener.cleanup()
    listeners.delete(doc)
  })
}

export function markEscapeKeydownHandled(event: KeyboardEvent) {
  handledEvents.add(event)
}

export function trackEscapeKeydown(node: HTMLElement, fn?: (event: KeyboardEvent) => void) {
  const doc = getDocument(node)
  trackHandledEscapeKeydown(doc)

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return
    if (event.isComposing) return
    fn?.(event)
  }

  const cleanup = addDomEvent(doc, "keydown", handleKeyDown, { capture: true })

  return () => {
    cleanup()
    releaseHandledEscapeKeydown(doc)
  }
}
