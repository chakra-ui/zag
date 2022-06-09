import { getActiveElement, getOwnerDocument, getOwnerWindow } from "@zag-js/dom-utils"

export function trackFocusedDescendantRemoval(node: HTMLElement | null) {
  if (!node) return
  const win = getOwnerWindow(node)
  const doc = getOwnerDocument(node)

  const observer = new win.MutationObserver(([mutation]) => {
    if (!mutation) return
    if (mutation.target !== node) return
    const el = getActiveElement(node)
    if (el === doc.body) node.focus()
  })

  observer.observe(node, { childList: true, subtree: true })
  return () => observer.disconnect()
}
