import { isHTMLElement } from "./is-element"

type Target = HTMLElement | EventTarget

export function contains(parent: Target | null | undefined, child: Target | null) {
  if (!parent || !child) return false
  if (!isHTMLElement(parent) || !isHTMLElement(child)) return false
  return parent === child || parent.contains(child)
}
