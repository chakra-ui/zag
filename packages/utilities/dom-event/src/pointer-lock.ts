import { addDomEvent } from "./add-dom-event"

type PointerLockHandlers = {
  onChange?: (locked: boolean) => void
}

export function trackPointerLock(doc: Document, handlers: PointerLockHandlers = {}) {
  const { onChange } = handlers
  const body = doc.body

  const supported = "pointerLockElement" in doc || "mozPointerLockElement" in doc
  const isLocked = () => !!doc.pointerLockElement

  function onPointerChange() {
    onChange?.(isLocked())
  }

  function onPointerError(event: Event) {
    if (isLocked()) onChange?.(false)
    console.error("PointerLock error occured:", event)
    doc.exitPointerLock()
  }

  if (!supported) return

  try {
    body.requestPointerLock()
  } catch {}

  // prettier-ignore
  const cleanup = [
    addDomEvent(doc, "pointerlockchange", onPointerChange, false),
    addDomEvent(doc, "pointerlockerror", onPointerError, false)
  ]

  return () => {
    cleanup.forEach((cleanup) => cleanup())
    doc.exitPointerLock()
  }
}
