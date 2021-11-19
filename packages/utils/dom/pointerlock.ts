type PointerLockHandlers = {
  onPointerLock?: VoidFunction
  onPointerUnlock?: VoidFunction
}

export function addPointerlockChangeListener(doc: Document, fn: VoidFunction) {
  doc.addEventListener("webkitpointerlockchange", fn, false)
  doc.addEventListener("mozpointerlockchange", fn, false)
  doc.addEventListener("pointerlockchange", fn, false)
  return function cleaup() {
    doc.removeEventListener("mozpointerlockchange", fn, false)
    doc.removeEventListener("pointerlockchange", fn, false)
  }
}

export function addPointerlockErrorListener(doc: Document, fn: (e: Event) => void) {
  doc.addEventListener("webkitpointerlockerror", fn, false)
  doc.addEventListener("mozpointerlockerror", fn, false)
  doc.addEventListener("pointerlockerror", fn, false)
  return function cleanup() {
    doc.removeEventListener("webkitpointerlockerror", fn, false)
    doc.removeEventListener("mozpointerlockerror", fn, false)
    doc.removeEventListener("pointerlockerror", fn, false)
  }
}

function getPointerlockFunc(el: HTMLElement) {
  return el.requestPointerLock || (el as any).mozRequestPointerLock || (el as any).webkitRequestPointerLock
}

function getRemovePointerlockFunc(doc: Document) {
  return doc.exitPointerLock || (doc as any).mozExitPointerLock || (doc as any).webkitExitPointerLock
}

export function getPointerlockElement(doc: Document) {
  return doc.pointerLockElement || (doc as any).mozPointerLockElement || (doc as any).webkitPointerLockElement
}

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
    doc.exitPointerLock = getRemovePointerlockFunc(doc)
    doc.exitPointerLock()
  }

  const cleanups: Set<Function> = new Set()

  function addEventListeners() {
    cleanups.add(addPointerlockChangeListener(doc, onPointerChange))
    cleanups.add(addPointerlockErrorListener(doc, onPointerError))
  }

  function dispose() {
    if (!isSupported()) return
    cleanups.forEach((fn) => fn())
    cleanups.clear()
    exit()
  }

  function setup() {
    if (!isSupported()) return
    body.requestPointerLock = getPointerlockFunc(body)
    body.requestPointerLock()
    addEventListeners()
  }

  setup()
  return dispose
}
