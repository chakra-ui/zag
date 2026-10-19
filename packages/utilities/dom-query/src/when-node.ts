import type { MaybeFn } from "@zag-js/types"
import { raf } from "./raf"

export interface WhenNodeOptions {
  /**
   * Whether to wait for the framework to commit its DOM.
   */
  defer?: boolean | undefined
  /**
   * Called when the node never became available.
   */
  onMissing?: VoidFunction | undefined
}

/**
 * Invokes `fn` with the node and returns its cleanup. Deferring waits for the framework's commit
 * (microtask, then the next DOM mutation or frame, whichever comes first): a node read at call time
 * may be missing, or about to be replaced by a consumer re-parenting its content.
 */
export function whenNode<T extends Element = HTMLElement>(
  nodeOrFn: MaybeFn<T | null>,
  fn: (node: T) => VoidFunction | void,
  options: WhenNodeOptions = {},
): VoidFunction {
  const { defer, onMissing } = options

  const getNode = () => (typeof nodeOrFn === "function" ? nodeOrFn() : nodeOrFn)
  const cleanups: (VoidFunction | undefined | void)[] = []

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

      // Content that mounts a render later (e.g. through presence with `lazyMount`) commits after
      // this microtask. Pick it up when its DOM is inserted instead of waiting for the next frame,
      // and keep the frame as the fallback for nodes the observer can't see (shadow roots, iframes).
      let settled = false
      const settle = (node: T | null) => {
        if (cancelled || settled) return
        settled = true
        stopObserving()
        cancelFrame()
        setup(node)
      }

      const stopObserving = observeDocument(() => {
        const node = getNode()
        if (node) settle(node)
      })

      const cancelFrame = raf(() => settle(getNode()))

      cleanups.push(stopObserving, cancelFrame)
    })
  }

  return () => {
    cleanups.forEach((fn) => fn?.())
  }
}

function observeDocument(callback: VoidFunction): VoidFunction {
  const doc = globalThis.document
  const win = doc?.defaultView
  if (!doc || !win?.MutationObserver) return noop
  const observer = new win.MutationObserver(callback)
  observer.observe(doc, { childList: true, subtree: true })
  return () => observer.disconnect()
}

const noop = () => {}
