import { isLeftClick } from "tiny-guard"

let changeCount = 0
let originalBodyPointerEvents: string

type PointerEventOptions = {
  disabled: boolean
  doc?: Document
}

export class BodyPointerEvent {
  isTouchOrPenPressed = false
  isLeftClickPressed = false
  disabled = false
  doc: Document

  unlisten: VoidFunction = () => {}
  unapply: VoidFunction = () => {}

  constructor(opts: PointerEventOptions) {
    this.disabled = opts.disabled
    this.doc = opts.doc ?? document
  }

  setOptions = (opts: Partial<PointerEventOptions>) => {
    if (opts.disabled != null) this.disabled = opts.disabled
    if (opts.doc != null) this.doc = opts.doc
  }

  listen = () => {
    const onPointerDown = (event: PointerEvent) => {
      const isMouse = event.pointerType === "mouse"
      this.isTouchOrPenPressed = !isMouse
      this.isLeftClickPressed = isMouse && isLeftClick(event)
    }

    const onPointerUp = () => {
      this.isTouchOrPenPressed = false
      this.isLeftClickPressed = false
    }

    this.doc.addEventListener("pointerdown", onPointerDown)
    this.doc.addEventListener("pointerup", onPointerUp)

    this.unlisten = () => {
      this.doc.removeEventListener("pointerdown", onPointerDown)
      this.doc.removeEventListener("pointerup", onPointerUp)
    }
  }

  flush = () => {
    changeCount--
    if (changeCount === 0) {
      this.doc.body.style.pointerEvents = originalBodyPointerEvents
    }
  }

  apply = () => {
    if (!this.disabled) return

    if (changeCount === 0) {
      originalBodyPointerEvents = this.doc.body.style.pointerEvents
    }

    this.doc.body.style.pointerEvents = "none"
    changeCount++

    this.unapply = () => {
      if (this.isTouchOrPenPressed) {
        this.doc.addEventListener("click", this.flush, { once: true })
      } else if (this.isLeftClickPressed) {
        this.doc.addEventListener("pointerup", this.flush, { once: true })
      } else {
        this.flush()
      }
    }
  }
}
