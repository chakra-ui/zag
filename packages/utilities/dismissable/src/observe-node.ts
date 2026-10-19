import { createSharedMutationObserver, getDocument, raf } from "@zag-js/dom-query"

const nodeObserver = /* @__PURE__ */ createSharedMutationObserver({
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["id"],
})

export interface ObserveNodeOptions {
  /** Attach DOM behavior and return the cleanup for this node. */
  attach: (node: HTMLElement) => VoidFunction
  /** The root in which the content is resolved, including a shadow root or iframe document. */
  getRootNode?: (() => Document | ShadowRoot | Element) | undefined
  defer?: boolean | undefined
  onMissing?: VoidFunction | undefined
}

/** Observe committed node identity without using rendering frames as a mount deadline. */
export function observeNode(getNode: () => HTMLElement | null, options: ObserveNodeOptions): VoidFunction {
  const root = options.getRootNode?.() ?? getDocument(getNode())
  let node: HTMLElement | null = null
  let detach: VoidFunction | undefined
  let disposed = false
  let started = false

  const sync = () => {
    if (disposed || !started) return
    const next = getNode()
    const connected = next?.isConnected ? next : null
    if (connected === node) return
    detach?.()
    detach = undefined
    node = null
    // Record the node only once attached, so a failed attach is retried on the next mutation.
    if (connected) detach = options.attach(connected)
    node = connected
  }

  // Keep observing after attachment: a portal can replace content while the layer stays open.
  // Observe ids as well as insertions, since scoped lookups resolve nodes by id.
  const stopRoot = nodeObserver.observe(root, sync)
  // A scoped root can be connected or removed without a mutation inside that root.
  const doc = getDocument(root)
  const stopDocument = root !== doc ? nodeObserver.observe(doc, sync) : undefined

  const start = () => {
    if (disposed) return
    started = true
    sync()
  }

  if (options.defer) queueMicrotask(start)
  else start()

  // Retain the missing-node diagnostic, but continue observing until disposal.
  const cancelWarning = options.onMissing
    ? raf(() => {
        if (!disposed && !node) options.onMissing?.()
      })
    : undefined

  return () => {
    if (disposed) return
    disposed = true
    stopRoot()
    stopDocument?.()
    cancelWarning?.()
    detach?.()
    detach = undefined
    node = null
  }
}
