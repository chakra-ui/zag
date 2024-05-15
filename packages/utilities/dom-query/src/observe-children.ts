import { raf } from "./raf"

type MaybeElement = HTMLElement | null
type NodeOrFn = MaybeElement | (() => MaybeElement)

export interface ObserveChildrenOptions {
  callback: MutationCallback
  defer?: boolean
}

function observeChildrenImpl(node: MaybeElement, options: ObserveChildrenOptions) {
  const { callback: fn } = options
  if (!node) return
  const win = node.ownerDocument.defaultView || window
  const obs = new win.MutationObserver(fn)
  obs.observe(node, { childList: true, subtree: true })
  return () => obs.disconnect()
}

export function observeChildren(nodeOrFn: NodeOrFn, options: ObserveChildrenOptions) {
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
