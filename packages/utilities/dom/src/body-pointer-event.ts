import { isLeftClick } from "@ui-machines/utils"
import { nextTick } from "./next-tick"

let changeCount = 0
let originalBodyPointerEvents: string

type PointerEventOptions = {
  disabled: boolean
  document?: Document
}

export function preventBodyPointerEvents(el: HTMLElement | null, opts: Partial<PointerEventOptions> = {}) {
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

  function reset() {
    changeCount--
    if (changeCount === 0) {
      doc.body.style.pointerEvents = originalBodyPointerEvents
    }
    if (el) {
      el.style.pointerEvents = ""
    }
  }

  function apply() {
    if (disabled) return

    if (changeCount === 0) {
      originalBodyPointerEvents = doc.body.style.pointerEvents
    }

    doc.body.style.pointerEvents = "none"
    if (el) {
      el.style.pointerEvents = "auto"
    }

    changeCount++

    return function () {
      if (isTouchOrPenPressed) {
        doc.addEventListener("click", reset, { once: true })
      } else if (isLeftClickPressed) {
        doc.addEventListener("pointerup", reset, { once: true })
      } else {
        reset()
      }
    }
  }

  const cleanups: Array<VoidFunction | undefined> = []
  cleanups.push(apply())
  nextTick(() => {
    cleanups.push(listen())
  })

  return function () {
    cleanups.forEach((cleanup) => cleanup?.())
  }
}
