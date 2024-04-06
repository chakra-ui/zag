import { contains, getDocument, getEventTarget, getWindow } from "@zag-js/dom-query"
import { addDomEvent } from "./add-dom-event"
import { getEventPoint } from "./get-event-point"
import { noop, pipe } from "./pipe"

interface Point {
  x: number
  y: number
}

interface TapDetails {
  /**
   * The current position of the pointer.
   */
  point: Point
  /**
   * The event that triggered the move.
   */
  event: PointerEvent
}

export interface TrackPressOptions {
  /**
   * The element that will be used to track the pointer events.
   */
  pointerNode: Element | null
  /**
   * The element that will be used to track the keyboard focus events.
   */
  keyboardNode?: Element | null
  /**
   * A function that determines if the key is valid for the press event.
   */
  isValidKey?(event: KeyboardEvent): boolean
  /**
   * A function that will be called when the pointer is pressed.
   */
  onPress?(details: TapDetails): void
  /**
   * A function that will be called when the pointer is pressed down.
   */
  onPressStart?(details: TapDetails): void
  /**
   * A function that will be called when the pointer is pressed up or cancelled.
   */
  onPressEnd?(details: TapDetails): void
}

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
  const doc = getDocument(pointerNode)

  let removeStartListeners: VoidFunction = noop
  let removeEndListeners: VoidFunction = noop
  let removeAccessibleListeners: VoidFunction = noop

  const getInfo = (event: PointerEvent): TapDetails => ({
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

    const removePointerUpListener = addDomEvent(win, "pointerup", endPointerPress, { passive: !onPress })
    const removePointerCancelListener = addDomEvent(win, "pointercancel", cancelPress, { passive: !onPressEnd })

    removeEndListeners = pipe(removePointerUpListener, removePointerCancelListener)

    if (doc.activeElement === keyboardNode && startEvent.pointerType === "mouse") {
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

  return function () {
    removeStartListeners()
    removeEndListeners()
    removeAccessibleListeners()
  }
}
