import { isLeftClick } from "tiny-guard"

let changeCount = 0
let originalBodyPointerEvents: string

type PointerEventOptions = {
  disabled: boolean
  document?: Document
}

export function preventBodyPointerEvents(opts: Partial<PointerEventOptions> = {}) {
  const { disabled = false, document: docProp } = opts
  const doc: Document = docProp || document

  let isTouchOrPenPressed = false
  let isLeftClickPressed = false

  function listen() {
    const onPointerDown = (event: PointerEvent) => {
      const isMouse = event.pointerType === "mouse"
      isTouchOrPenPressed = !isMouse
      isLeftClickPressed = isMouse && isLeftClick(event)
    }

    const onPointerUp = () => {
      isTouchOrPenPressed = false
      isLeftClickPressed = false
    }

    doc.addEventListener("pointerdown", onPointerDown)
    doc.addEventListener("pointerup", onPointerUp)

    return function () {
      doc.removeEventListener("pointerdown", onPointerDown)
      doc.removeEventListener("pointerup", onPointerUp)
    }
  }

  function flush() {
    changeCount--
    if (changeCount === 0) {
      doc.body.style.pointerEvents = originalBodyPointerEvents
    }
  }

  function apply() {
    if (!disabled) return

    if (changeCount === 0) {
      originalBodyPointerEvents = doc.body.style.pointerEvents
    }

    doc.body.style.pointerEvents = "none"
    changeCount++

    return function () {
      if (isTouchOrPenPressed) {
        doc.addEventListener("click", flush, { once: true })
      } else if (isLeftClickPressed) {
        doc.addEventListener("pointerup", flush, { once: true })
      } else {
        flush()
      }
    }
  }

  return { apply, listen }
}
