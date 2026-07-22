import { isActiveElement } from "./node"
import { getTabbableEdges, getTabbables } from "./tabbable"

export interface InitialFocusOptions {
  root: HTMLElement | null
  getInitialEl?: (() => HTMLElement | null) | undefined
  enabled?: boolean | undefined
  filter?: ((el: HTMLElement) => boolean) | undefined
}

export function getInitialFocus(options: InitialFocusOptions): HTMLElement | undefined {
  const { root, getInitialEl, filter, enabled = true } = options

  if (!enabled) return

  // 1. explicit override (e.g. alertdialog → close button)
  let node: HTMLElement | null | undefined = typeof getInitialEl === "function" ? getInitialEl() : getInitialEl

  // 2. opt-in wins over skip
  node ||= root?.querySelector<HTMLElement>("[data-autofocus],[autofocus]")

  // 3. first tabbable that isn't opted out of autofocus
  if (!node) {
    const tabbables = getTabbables(root).filter((el) => (filter ? filter(el) : true))
    node = tabbables.find((el) => !el.hasAttribute("data-no-autofocus"))
  }

  // 4. content root fallback (e.g. all chrome controls opted out)
  return node || root || undefined
}

export function isValidTabEvent(event: Pick<KeyboardEvent, "shiftKey" | "currentTarget">): boolean {
  const container = event.currentTarget as HTMLElement | null
  if (!container) return false

  const [firstTabbable, lastTabbable] = getTabbableEdges(container)

  if (isActiveElement(firstTabbable) && event.shiftKey) return false
  if (isActiveElement(lastTabbable) && !event.shiftKey) return false
  if (!firstTabbable && !lastTabbable) return false

  return true
}
