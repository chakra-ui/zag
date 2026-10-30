import type { MaybeFn } from "@zag-js/types"
import { createSharedMutationObserver } from "./mutation-observer"
import { raf } from "./raf"
import { noop } from "./shared"

const childListObserver = /* @__PURE__ */ createSharedMutationObserver({ childList: true, subtree: true })

export interface WhenNodeOptions {
  /**
   * Whether to wait for the framework to commit its DOM.
   */
  defer?: boolean | undefined
  /**
   * Called when the node never became available.
   */
  onMissing?: VoidFunction | undefined
  /**
   * The root the node is queried from. When set, a deferred lookup also resolves on DOM insertion.
   */
  getRootNode?: (() => Node) | undefined
}

/**
 * Invokes `fn` with the node and returns its cleanup. Deferring waits for the framework's commit
 * (microtask, then the next DOM insertion or frame, whichever comes first): a node read at call time
 * may be missing, or about to be replaced by a consumer re-parenting its content.
 */
export function whenNode<T extends Element = HTMLElement, Args extends any[] = []>(
  nodeOrFn: MaybeFn<T | null>,
  fn: (node: T) => ((...args: Args) => void) | VoidFunction | void,
  options: WhenNodeOptions = {},
): (...args: Args) => void {
  const { defer, onMissing, getRootNode } = options

  const getNode = () => (typeof nodeOrFn === "function" ? nodeOrFn() : nodeOrFn)
  const cleanups: (((...args: Args) => void) | VoidFunction | undefined | void)[] = []

  const setup = (node: T | null) => {
    if (!node) return onMissing?.()
    cleanups.push(fn(node))
  }

  if (!defer) {
    setup(getNode())
  } else {
    let cancelled = false
    cleanups.push(() => {
      cancelled = true
    })

    queueMicrotask(() => {
      if (cancelled) return

      const committed = getNode()
      if (committed) {
        setup(committed)
        return
      }

      // Presence-mounted content commits after this microtask; the frame covers nodes the observer can't see
      let settled = false
      const settle = (node: T | null) => {
        if (cancelled || settled) return
        settled = true
        stopObserving()
        cancelFrame()
        setup(node)
      }

      const rootNode = getRootNode?.()
      const stopObserving = rootNode
        ? childListObserver.observe(rootNode, () => {
            const node = getNode()
            if (node) settle(node)
          })
        : noop

      const cancelFrame = raf(() => settle(getNode()))

      cleanups.push(stopObserving, cancelFrame)
    })
  }

  // arguments are forwarded, so a caller can pass teardown intent through to the inner cleanup
  return (...args: Args) => {
    cleanups.forEach((fn) => (fn as ((...a: Args) => void) | undefined)?.(...args))
  }
}
