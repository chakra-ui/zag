import { isHTMLElement } from "./is"

type Target = HTMLElement | EventTarget | null | undefined

export function contains(parent: Target, child: Target) {
  if (!parent || !child) return false
  if (!isHTMLElement(parent) || !isHTMLElement(child)) return false
  return parent === child || parent.contains(child)
}
