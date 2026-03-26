import type { BindableContext, BindableRefs, PropFn } from "@zag-js/core"
import type { NavigationMenuSchema } from "./navigation-menu.types"

export function setCloseTimeout(
  refs: BindableRefs<NavigationMenuSchema>,
  context: BindableContext<NavigationMenuSchema>,
  prop: PropFn<NavigationMenuSchema>,
) {
  clearCloseTimeout(refs)

  const closeTimeoutId = window.setTimeout(() => {
    context.set("value", "")
  }, prop("closeDelay"))

  refs.set("closeTimeoutId", closeTimeoutId)
}

export function clearCloseTimeout(refs: BindableRefs<NavigationMenuSchema>) {
  const closeTimeoutId = refs.get("closeTimeoutId")
  if (closeTimeoutId) {
    clearTimeout(closeTimeoutId)
    refs.set("closeTimeoutId", null)
  }
}

export function setOpenTimeout(refs: BindableRefs<NavigationMenuSchema>, value: string, timeoutId: number) {
  const openTimeoutIds = refs.get("openTimeoutIds")
  refs.set("openTimeoutIds", {
    ...openTimeoutIds,
    [value]: timeoutId,
  })
}

export function clearOpenTimeout(refs: BindableRefs<NavigationMenuSchema>, value: string) {
  const openTimeoutIds = refs.get("openTimeoutIds")
  const timeoutId = openTimeoutIds[value]
  if (timeoutId) {
    clearTimeout(timeoutId)
    // Remove the property by destructuring
    const { [value]: _, ...rest } = openTimeoutIds
    refs.set("openTimeoutIds", rest)
  }
}

export function clearAllOpenTimeouts(refs: BindableRefs<NavigationMenuSchema>) {
  const openTimeoutIds = refs.get("openTimeoutIds")
  Object.values(openTimeoutIds).forEach((timeoutId) => {
    if (timeoutId) clearTimeout(timeoutId)
  })
  refs.set("openTimeoutIds", {})
}
