import { trapFocus, type TrapFocusOptions } from "@zag-js/focus-trap"
import type { RefObject } from "preact"
import { useEffect } from "preact/hooks"

export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  options: TrapFocusOptions & { enabled?: boolean } = {},
) {
  const { enabled = true, ...trapOptions } = options

  useEffect(() => {
    if (!enabled) return
    const el = ref.current
    if (!el) return

    return trapFocus(el, trapOptions)
  }, [enabled])
}
