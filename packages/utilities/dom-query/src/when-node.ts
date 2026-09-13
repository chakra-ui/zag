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
 * (microtask, then frame): a node read at call time may be missing, or about to be replaced by a
 * consumer re-parenting its content.
 */
export function whenNode<T extends Element = HTMLElement, Args extends any[] = []>(
  nodeOrFn: MaybeFn<T | null>,
  fn: (node: T) => ((...args: Args) => void) | VoidFunction | void,
  options: WhenNodeOptions = {},
): (...args: Args) => void {
  const { defer, onMissing } = options

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

      cleanups.push(
        raf(() => {
          if (cancelled) return
          setup(getNode())
        }),
      )
    })
  }

  // arguments are forwarded, so a caller can pass teardown intent through to the inner cleanup
  return (...args: Args) => {
    cleanups.forEach((fn) => (fn as ((...a: Args) => void) | undefined)?.(...args))
  }
}
