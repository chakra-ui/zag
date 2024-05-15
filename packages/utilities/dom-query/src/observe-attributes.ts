import { raf } from "./raf"

type MaybeElement = HTMLElement | null
type NodeOrFn = MaybeElement | (() => MaybeElement)

export interface ObserveAttributeOptions {
  attributes: string[]
  callback(record: MutationRecord): void
  defer?: boolean
}

function observeAttributesImpl(node: MaybeElement, options: ObserveAttributeOptions) {
  if (!node) return
  const { attributes, callback: fn } = options
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

export function observeAttributes(nodeOrFn: NodeOrFn, options: ObserveAttributeOptions) {
  const { defer } = options
  const func = defer ? raf : (v: any) => v()
  const cleanups: (VoidFunction | undefined)[] = []
  cleanups.push(
    func(() => {
      const node = typeof nodeOrFn === "function" ? nodeOrFn() : nodeOrFn
      cleanups.push(observeAttributesImpl(node, options))
    }),
  )
  return () => {
    cleanups.forEach((fn) => fn?.())
  }
}
