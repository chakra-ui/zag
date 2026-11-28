import { addDomEvent, getEventPoint, getEventTarget } from "../event"
import { contains, getWindow, isActiveElement } from "../node"
import { noop, pipe } from "../shared"
import type { Point } from "../types"

export interface PressDetails {
  /**
   * Where the pointer is
   */
  point: Point
  /**
   * The event behind this report
   */
  event: PointerEvent
}

export interface TrackPressOptions {
  /**
   * The element pressed with a pointer
   */
  pointerNode: Element | null
  /**
   * The element pressed with a key while focused
   * @default pointerNode
   */
  keyboardNode?: Element | null | undefined
  /**
   * Which keys press it
   * @default Enter
   */
  isValidKey?(event: KeyboardEvent): boolean
  /**
   * Called when a press ends on the element
   */
  onPress?(details: PressDetails): void
  /**
   * Called when a press starts
   */
  onPressStart?(details: PressDetails): void
  /**
   * Called when a press ends off the element or is cancelled
   */
  onPressEnd?(details: PressDetails): void
}

/**
 * Follows presses on an element by pointer or key, reporting the start, the end, and whether it ended on the
 * element. Returns a cleanup.
 */
export function trackPress(options: TrackPressOptions) {
  const {
    pointerNode,
    keyboardNode = pointerNode,
    onPress,
    onPressStart,
    onPressEnd,
    isValidKey = (e) => e.key === "Enter",
  } = options

  if (!pointerNode) return noop

  const win = getWindow(pointerNode)

  let removeStartListeners: VoidFunction = noop
  let removeEndListeners: VoidFunction = noop
  let removeAccessibleListeners: VoidFunction = noop

  const getInfo = (event: PointerEvent): PressDetails => ({
    point: getEventPoint(event),
    event,
  })

  function startPress(event: PointerEvent) {
    onPressStart?.(getInfo(event))
  }

  function cancelPress(event: PointerEvent) {
    onPressEnd?.(getInfo(event))
  }

  const startPointerPress = (startEvent: PointerEvent) => {
    removeEndListeners()

    const endPointerPress = (endEvent: PointerEvent) => {
      const target = getEventTarget<Element>(endEvent)
      if (contains(pointerNode, target)) {
        onPress?.(getInfo(endEvent))
      } else {
        onPressEnd?.(getInfo(endEvent))
      }
    }

    const removePointerUpListener = addDomEvent(win, "pointerup", endPointerPress, { passive: !onPress, once: true })
    const removePointerCancelListener = addDomEvent(win, "pointercancel", cancelPress, {
      passive: !onPressEnd,
      once: true,
    })

    removeEndListeners = pipe(removePointerUpListener, removePointerCancelListener)

    if (isActiveElement(keyboardNode) && startEvent.pointerType === "mouse") {
      startEvent.preventDefault()
    }

    startPress(startEvent)
  }

  const removePointerListener = addDomEvent(pointerNode, "pointerdown", startPointerPress, { passive: !onPressStart })
  const removeFocusListener = addDomEvent(keyboardNode, "focus", startAccessiblePress)

  removeStartListeners = pipe(removePointerListener, removeFocusListener)

  function startAccessiblePress() {
    const handleKeydown = (keydownEvent: KeyboardEvent) => {
      if (!isValidKey(keydownEvent)) return

      const handleKeyup = (keyupEvent: KeyboardEvent) => {
        if (!isValidKey(keyupEvent)) return
        const evt = new win.PointerEvent("pointerup")
        const info = getInfo(evt)
        onPress?.(info)
        onPressEnd?.(info)
      }

      removeEndListeners()
      removeEndListeners = addDomEvent(keyboardNode, "keyup", handleKeyup)

      const evt = new win.PointerEvent("pointerdown")
      startPress(evt)
    }

    const handleBlur = () => {
      const evt = new win.PointerEvent("pointercancel")
      cancelPress(evt)
    }

    const removeKeydownListener = addDomEvent(keyboardNode, "keydown", handleKeydown)
    const removeBlurListener = addDomEvent(keyboardNode, "blur", handleBlur)

    removeAccessibleListeners = pipe(removeKeydownListener, removeBlurListener)
  }

  return () => {
    removeStartListeners()
    removeEndListeners()
    removeAccessibleListeners()
  }
}
