import { trapFocus, type TrapFocusOptions } from "@zag-js/focus-trap"
import { useEffect, type RefObject } from "react"

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
