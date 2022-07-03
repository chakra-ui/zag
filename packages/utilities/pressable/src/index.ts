import { addDomEvent, getDocument, isDisabled, isSelfEvent, isVirtualPointerEvent } from "@zag-js/dom-utils"
import { callAll } from "@zag-js/utils"

export type PressableOptions = {
  preventFocusOnPress?: boolean
  shouldCancelOnPointerExit?: boolean
  allowTextSelectionOnPress?: boolean
}

export function trackPressable(el: HTMLElement | null, options: PressableOptions) {
  if (!el) return

  const { preventFocusOnPress } = options

  const doc = getDocument(el)

  const state: Record<string, any> = {
    isPressed: false,
    ignoreEmulatedMouseEvents: false,
    ignoreClickAfterPress: false,
    didFirePressStart: false,
    activePointerId: null,
    target: null,
    isOverTarget: false,
    pointerType: null,
  }

  const cleanups = new Set<VoidFunction>()
  const cleanup = callAll(() => {
    cleanups.forEach((cleanup) => cleanup())
    cleanups.clear()
  })

  const cancel = () => {
    if (!state.isPressed) return
    state.isPressed = false
    state.isOverTarget = false
    state.activePointerId = null
    state.pointerType = null
    cleanup()
  }

  const onPointerUp = (e: PointerEvent) => {
    if (!isSelfEvent(e) || state.pointerType === "virtual") {
      return
    }
  }

  const onPointerCancel = () => {
    cancel()
  }

  const onPointerDown = (e: PointerEvent) => {
    if (!e.isPrimary || !isSelfEvent(e)) {
      return
    }

    if (isVirtualPointerEvent(e)) {
      state.pointerType = "virtual"
      return
    }

    if (!el.draggable) {
      e.preventDefault()
    }

    state.pointerType = e.pointerType

    e.stopPropagation()

    if (!state.isPressed) {
      state.isPressed = true
      state.isOverTarget = true
      state.activePointerId = e.pointerId
      state.target = el

      if (!isDisabled(el) && !preventFocusOnPress) {
        el.focus({ preventScroll: true })
      }

      cleanups.add(addDomEvent(doc, "pointerup", onPointerUp, false))
      cleanups.add(addDomEvent(doc, "pointercancel", onPointerCancel, false))
    }
  }

  cleanups.add(addDomEvent(el, "pointerdown", onPointerDown))

  const onDragStart = (e: DragEvent) => {
    if (!isSelfEvent(e)) return
    cancel()
  }

  cleanups.add(addDomEvent(el, "dragstart", onDragStart))

  return cancel
}
