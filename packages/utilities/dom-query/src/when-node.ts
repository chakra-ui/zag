import type { MaybeFn } from "@zag-js/types"
import { raf } from "./raf"

export interface WhenNodeOptions {
  /**
   * Whether the node may not be committed to the DOM yet.
   * When `false`, the node is resolved once and never awaited.
   */
  defer?: boolean | undefined
  /**
   * Called when the node never became available.
   */
  onMissing?: VoidFunction | undefined
}

/**
 * Invokes `fn` with the node as soon as it is available:
 * synchronously if it is already committed, otherwise on the microtask that follows the
 * framework's render pass, falling back to the next frame.
 *
 * Machine effects run before the framework commits its DOM, so a lazily-rendered node is
 * usually `null` at call time but present a microtask later — waiting a whole frame leaves
 * handlers unregistered while the element is already painted and interactive.
 *
 * `fn` is never called without a node; use `onMissing` to handle that case.
 * Returns a cleanup that cancels any pending work and runs the cleanup `fn` returned.
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

  const node = getNode()

  if (!defer || node) {
    setup(node)
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

  return () => {
    cleanups.forEach((fn) => fn?.())
  }
}
