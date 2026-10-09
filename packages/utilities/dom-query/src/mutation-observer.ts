import type { MaybeElement, MaybeElementOrFn } from "./types"
import { whenNode } from "./when-node"

const noop = () => {}

export interface ObserveAttributeOptions {
  attributes: string[]
  callback(record: MutationRecord): void
  defer?: boolean | undefined
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

export function observeAttributes(nodeOrFn: MaybeElementOrFn, options: ObserveAttributeOptions) {
  const getNode = () => (typeof nodeOrFn === "function" ? nodeOrFn() : nodeOrFn) ?? null
  if (!options.defer) return observeAttributesImpl(getNode(), options) ?? noop
  return whenNode(getNode, (node) => observeAttributesImpl(node, options), { defer: true, frame: true })
}

export interface ObserveChildrenOptions {
  callback: MutationCallback
  defer?: boolean | undefined
}

function observeChildrenImpl(node: MaybeElement, options: ObserveChildrenOptions) {
  const { callback: fn } = options
  if (!node) return
  const win = node.ownerDocument.defaultView || window
  const obs = new win.MutationObserver(fn)
  obs.observe(node, { childList: true, subtree: true })
  return () => obs.disconnect()
}

export function observeChildren(nodeOrFn: MaybeElementOrFn, options: ObserveChildrenOptions) {
  const getNode = () => (typeof nodeOrFn === "function" ? nodeOrFn() : nodeOrFn) ?? null
  if (!options.defer) return observeChildrenImpl(getNode(), options) ?? noop
  return whenNode(getNode, (node) => observeChildrenImpl(node, options), { defer: true, frame: true })
}
