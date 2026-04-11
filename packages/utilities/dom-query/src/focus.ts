import { isActiveElement } from "./node"
import { AnimationFrame } from "./raf"

/**
 * Focus `el` unless it's already the active element in its root.
 */
export function focusElement(el: HTMLElement | null | undefined, options?: FocusOptions): void {
  if (!el) return
  if (isActiveElement(el)) return
  el.focus(options)
}

export interface TryFocusOptions {
  retries?: number
  guard?: () => boolean
  focusOptions?: FocusOptions
}

/**
 * Focus the element returned by `getEl`, retrying across animation frames
 * until it exists. Returns a cleanup function that cancels any pending retry.
 */
export function tryFocusElement(
  getEl: () => HTMLElement | null | undefined,
  options: TryFocusOptions = {},
): VoidFunction {
  const { retries = 5, guard, focusOptions } = options
  const frame = AnimationFrame.create()
  let remaining = retries

  const attempt = () => {
    if (guard && !guard()) return
    const el = getEl()
    if (el) {
      focusElement(el, focusOptions)
      return
    }
    if (remaining-- > 0) frame.request(attempt)
  }

  attempt()
  return frame.cleanup
}
