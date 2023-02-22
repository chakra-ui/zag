export type ObserveAttributesCallback = (record: MutationRecord) => void

export function observeAttributes(node: HTMLElement | null, attributes: string[], fn: ObserveAttributesCallback) {
  if (!node) return

  const win = node.ownerDocument.defaultView || window

  const obs = new win.MutationObserver((changes) => {
    for (const change of changes) {
      if (change.type === "attributes" && change.attributeName && attributes.includes(change.attributeName)) {
        fn(change)
      }
    }
  })

  obs.observe(node, { attributes: true, attributeFilter: attributes })

  return () => obs.disconnect()
}
