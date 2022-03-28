import { isLeftClick, pipe } from "@ui-machines/utils"
import { addDomEvent } from "./listener"
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

    // prettier-ignore
    return pipe(
        addDomEvent(doc, "pointerdown", onPointerDown),
        addDomEvent(doc,"pointerup", onPointerUp)
      )
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
        addDomEvent(doc, "click", reset, { once: true })
      } else if (isLeftClickPressed) {
        addDomEvent(doc, "pointerup", reset, { once: true })
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
