import { getTabbableEdges, getTabbables } from "./tabbable"

export interface InitialFocusOptions {
  root: HTMLElement | null
  getInitialEl?: () => HTMLElement | null
  enabled?: boolean
  filter?: (el: HTMLElement) => boolean
}

export function getInitialFocus(options: InitialFocusOptions): HTMLElement | undefined {
  const { root, getInitialEl, filter, enabled = true } = options

  if (!enabled) return

  let node: HTMLElement | null | undefined = null

  node ||= typeof getInitialEl === "function" ? getInitialEl() : getInitialEl
  node ||= root?.querySelector<HTMLElement>("[data-autofocus],[autofocus]")

  if (!node) {
    const tabbables = getTabbables(root)
    node = filter ? tabbables.filter(filter)[0] : tabbables[0]
  }

  return node || root || undefined
}

export function isValidTabEvent(event: Pick<KeyboardEvent, "shiftKey" | "currentTarget">): boolean {
  const container = event.currentTarget as HTMLElement | null
  if (!container) return false

  const [firstTabbable, lastTabbable] = getTabbableEdges(container)
  const doc = container.ownerDocument || document

  if (doc.activeElement === firstTabbable && event.shiftKey) return false
  if (doc.activeElement === lastTabbable && !event.shiftKey) return false
  if (!firstTabbable && !lastTabbable) return false

  return true
}
