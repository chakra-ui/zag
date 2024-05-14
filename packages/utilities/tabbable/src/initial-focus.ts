import { getFirstTabbable, getTabbableEdges } from "./tabbable"

export function getInitialFocus(
  container: HTMLElement | null,
  getInitialEl?: () => HTMLElement | null,
): HTMLElement | undefined {
  let node: HTMLElement | null | undefined = null
  node ||= typeof getInitialEl === "function" ? getInitialEl() : getInitialEl
  node ||= container?.querySelector<HTMLElement>("[data-autofocus],[autofocus]")
  node ||= getFirstTabbable(container)
  return node || container || undefined
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
