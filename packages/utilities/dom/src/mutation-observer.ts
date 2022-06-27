type Callback = (v: MutationRecord) => void

export function observeAttributes(node: Element | null, attributes: string | string[], fn: Callback) {
  if (!node) return
  const attrs = Array.isArray(attributes) ? attributes : [attributes]
  const win = node.ownerDocument.defaultView || window
  const obs = new win.MutationObserver((changes) => {
    for (const change of changes) {
      if (change.type === "attributes" && change.attributeName && attrs.includes(change.attributeName)) {
        fn(change)
      }
    }
  })

  obs.observe(node, { attributes: true, attributeFilter: attrs })

  return () => obs.disconnect()
}

export function observeChildren(node: Element | null, fn: Callback) {
  if (!node) return
  const win = node.ownerDocument.defaultView || window
  const obs = new win.MutationObserver((changes) => {
    for (const change of changes) {
      if (change.type === "childList") {
        fn(change)
      }
    }
  })

  obs.observe(node, { childList: true, subtree: true })

  return () => obs.disconnect()
}
