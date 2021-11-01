type PointerLockHandlers = { onPointerLock?: () => void; onPointerUnlock?: () => void }

export function requestPointerLock(doc: Document, handlers: PointerLockHandlers = {}) {
  const { onPointerLock, onPointerUnlock } = handlers
  const body = doc.body

  function isSupported() {
    return "pointerLockElement" in doc || "mozPointerLockElement" in doc || "webkitPointerLockElement" in doc
  }

  function hasLockElement() {
    return !!doc.pointerLockElement
  }

  function onPointerChange() {
    if (hasLockElement()) onPointerLock?.()
    else onPointerUnlock?.()
  }

  function onPointerError(event: Event) {
    const isLocked = hasLockElement()
    if (isLocked) onPointerUnlock?.()
    console.error("PointerLock error occured:", event)
    exit()
  }

  function exit() {
    doc.exitPointerLock = doc.exitPointerLock || (doc as any).mozExitPointerLock || (doc as any).webkitExitPointerLock
    doc.exitPointerLock()
  }

  function addEventListeners() {
    doc.addEventListener("webkitpointerlockchange", onPointerChange, false)
    doc.addEventListener("mozpointerlockchange", onPointerChange, false)
    doc.addEventListener("pointerlockchange", onPointerChange, false)
    doc.addEventListener("webkitpointerlockerror", onPointerError, false)
    doc.addEventListener("mozpointerlockerror", onPointerError, false)
    doc.addEventListener("pointerlockerror", onPointerError, false)
  }

  function dispose() {
    if (!isSupported()) return
    doc.removeEventListener("mozpointerlockchange", onPointerChange, false)
    doc.removeEventListener("pointerlockchange", onPointerChange, false)

    doc.removeEventListener("webkitpointerlockerror", onPointerError, false)
    doc.removeEventListener("mozpointerlockerror", onPointerError, false)
    doc.removeEventListener("pointerlockerror", onPointerError, false)
    exit()
  }

  function setup() {
    if (!isSupported()) return
    body.requestPointerLock =
      body.requestPointerLock || (body as any).mozRequestPointerLock || (body as any).webkitRequestPointerLock
    body.requestPointerLock()
    addEventListeners()
  }

  function getLockElement() {
    return doc.pointerLockElement || (doc as any).mozPointerLockElement || (doc as any).webkitPointerLockElement
  }

  return { setup, dispose, getLockElement }
}
