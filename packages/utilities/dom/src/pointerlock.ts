import { pipe } from "@zag-js/utils"
import { addDomEvent } from "./listener"

type PointerLockHandlers = {
  onPointerLock?: VoidFunction
  onPointerUnlock?: VoidFunction
}

export function addPointerlockChangeListener(doc: Document, fn: VoidFunction) {
  return addDomEvent(doc, "pointerlockchange", fn, false)
}

export function addPointerlockErrorListener(doc: Document, fn: (e: Event) => void) {
  doc.addEventListener("pointerlockerror", fn, false)
  return function cleanup() {
    doc.removeEventListener("pointerlockerror", fn, false)
  }
}

export function requestPointerLock(doc: Document, handlers: PointerLockHandlers = {}) {
  const { onPointerLock, onPointerUnlock } = handlers
  const body = doc.body

  const supported = "pointerLockElement" in doc || "mozPointerLockElement" in doc
  const locked = !!doc.pointerLockElement

  function onPointerChange() {
    if (locked) onPointerLock?.()
    else onPointerUnlock?.()
  }

  function onPointerError(event: Event) {
    if (locked) onPointerUnlock?.()
    console.error("PointerLock error occured:", event)
    exit()
  }

  function exit() {
    doc.exitPointerLock()
  }

  if (!supported) return

  body.requestPointerLock()

  const cleanup = pipe(
    addPointerlockChangeListener(doc, onPointerChange),
    addPointerlockErrorListener(doc, onPointerError),
  )

  return function dispose() {
    if (!supported) return
    cleanup()
    exit()
  }
}
