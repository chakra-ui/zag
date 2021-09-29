import { noop } from "tiny-fn"

export function observeNodeAttr(node: HTMLElement | null, attributes: string | string[], fn: VoidFunction) {
  if (!node) return noop
  const attrs = Array.isArray(attributes) ? attributes : [attributes]
  const obs = new MutationObserver((changes) => {
    for (const change of changes) {
      if (change.type === "attributes" && change.attributeName && attrs.includes(change.attributeName)) {
        fn()
      }
    }
  })

  obs.observe(node, { attributes: true, attributeFilter: attrs })

  return () => obs.disconnect()
}
