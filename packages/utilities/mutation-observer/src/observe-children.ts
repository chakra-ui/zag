export function observeChildren(node: HTMLElement | null, fn: (v: MutationRecord[]) => void) {
  if (!node) return

  const win = node.ownerDocument.defaultView || window

  const obs = new win.MutationObserver(fn)
  obs.observe(node, { childList: true, subtree: true })

  return () => obs.disconnect()
}
