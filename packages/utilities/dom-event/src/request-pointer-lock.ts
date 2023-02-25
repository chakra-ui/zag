import { addDomEvent } from "./add-dom-event"

export function requestPointerLock(doc: Document, fn?: (locked: boolean) => void) {
  const body = doc.body

  const supported = "pointerLockElement" in doc || "mozPointerLockElement" in doc
  const isLocked = () => !!doc.pointerLockElement

  function onPointerChange() {
    fn?.(isLocked())
  }

  function onPointerError(event: Event) {
    if (isLocked()) fn?.(false)
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
