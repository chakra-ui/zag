import { trapFocus, type TrapFocusOptions } from "@zag-js/focus-trap"
import { createEffect, onCleanup, type Accessor } from "solid-js"

export function useFocusTrap(
  el: Accessor<HTMLElement | undefined | null>,
  options: TrapFocusOptions & { enabled?: boolean } = {},
) {
  const { enabled = true, ...trapOptions } = options

  createEffect(() => {
    if (!enabled) return
    const node = el()
    if (!node) return

    const cleanup = trapFocus(node, trapOptions)

    onCleanup(cleanup)
  })
}
