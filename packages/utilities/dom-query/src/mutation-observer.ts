import { raf } from "./raf"
import type { MaybeElement, MaybeElementOrFn } from "./types"

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
  const { defer } = options
  const func = defer ? raf : (v: any) => v()
  const cleanups: (VoidFunction | undefined)[] = []
  cleanups.push(
    func(() => {
      const node = typeof nodeOrFn === "function" ? nodeOrFn() : nodeOrFn
      cleanups.push(observeChildrenImpl(node, options))
    }),
  )
  return () => {
    cleanups.forEach((fn) => fn?.())
  }
}
