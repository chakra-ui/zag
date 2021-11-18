import { noop } from "tiny-fn"

export function observeAttributes(node: HTMLElement | null, attributes: string | string[], fn: (v: MutationRecord) => void) {
  if (!node) return noop
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
