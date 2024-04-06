import { getWindow, isMac } from "@zag-js/dom-query"
import { addDomEvent } from "./add-dom-event"
import { pipe } from "./pipe"

export interface TrackFocusOptions {
  /**
   * Callback to be called when the element receives focus and is focus-visible.
   */
  onFocus?(e: FocusEvent): void
  /**
   * Callback to be called when the element loses focus.
   */
  onBlur?(e: FocusEvent): void
}

const isValidKey = (e: KeyboardEvent) => {
  return !(
    e.metaKey ||
    (!isMac() && e.altKey) ||
    e.ctrlKey ||
    e.key === "Control" ||
    e.key === "Shift" ||
    e.key === "Meta"
  )
}

export function trackFocusVisible(node: Element | null, options: TrackFocusOptions) {
  if (!node) return
  const { onFocus, onBlur } = options

  const win = getWindow(node)

  let focused = false

  const handleFocus = (e: FocusEvent) => {
    let isFocusVisible = false

    try {
      isFocusVisible = node.matches(":focus-visible")
    } catch {
      isFocusVisible = true
    }

    if (!isFocusVisible) return

    focused = true
    onFocus?.(e)
  }

  const handleBlur = (e: FocusEvent) => {
    if (!focused) return
    focused = false
    onBlur?.(e)
  }

  const handleKeydown = (e: KeyboardEvent) => {
    if (!node.matches(":focus") || !isValidKey(e)) return
    focused = true
    const evt = new win.FocusEvent("focus")
    onFocus?.(evt)
  }

  return pipe(
    addDomEvent(node, "focusin", handleFocus),
    addDomEvent(node, "focusout", handleBlur),
    addDomEvent(node, "keydown", handleKeydown, true),
  )
}
