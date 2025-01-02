import { isHTMLElement, isShadowRoot } from "./is"

type Target = HTMLElement | EventTarget | null | undefined

export function contains(parent: Target, child: Target) {
  if (!parent || !child) return false
  if (!isHTMLElement(parent) || !isHTMLElement(child)) return false

  const rootNode = child.getRootNode?.({ composed: true })
  if (parent.contains(child)) return true

  if (rootNode && isShadowRoot(rootNode)) {
    let next: any = child
    while (next) {
      if (parent === next) return true
      next = next.parentNode || next.host
    }
  }

  return false
}
