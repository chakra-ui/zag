import type { MaybeFn } from "@zag-js/types"
import { raf } from "./raf"

// How long a deferred lookup keeps checking for a node that mounts after the effect runs
const MAX_WAIT_MS = 1000

export interface WhenNodeOptions {
  /**
   * Whether to wait for the framework to commit its DOM.
   */
  defer?: boolean | undefined
  /**
   * When deferring, make the first check on the next frame instead of the next microtask.
   */
  frame?: boolean | undefined
  /**
   * Called when the node never became available.
   */
  onMissing?: VoidFunction | undefined
}

/**
 * Invokes `fn` with the node and returns its cleanup. Deferring waits for the framework's commit,
 * then keeps checking each frame (up to `MAX_WAIT_MS`): a node read at call time may be missing,
 * about to be replaced by a consumer re-parenting its content, or mounted lazily a few frames later.
 */
export function whenNode<T extends Element = HTMLElement>(
  nodeOrFn: MaybeFn<T | null>,
  fn: (node: T) => VoidFunction | void,
  options: WhenNodeOptions = {},
): VoidFunction {
  const { defer, frame, onMissing } = options

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
    let cancelFrame: VoidFunction | undefined
    const start = performance.now()

    const check = () => {
      if (cancelled) return
      const node = getNode()
      if (node || performance.now() - start >= MAX_WAIT_MS) return setup(node)
      cancelFrame = raf(check)
    }

    if (frame) {
      cancelFrame = raf(check)
    } else {
      queueMicrotask(() => {
        if (cancelled) return
        const node = getNode()
        if (node) return setup(node)
        cancelFrame = raf(check)
      })
    }

    cleanups.push(() => {
      cancelled = true
      cancelFrame?.()
    })
  }

  return () => {
    cleanups.forEach((fn) => fn?.())
  }
}
