import { options } from "preact"

/**
 * Runs `fn` and commits the renders it schedules synchronously, without depending on `preact/compat`.
 */
export function flushSync<R>(fn: () => R): R {
  const opts = options as { debounceRendering?: ((cb: VoidFunction) => void) | undefined }
  const prevDebounce = opts.debounceRendering
  let flush: VoidFunction | undefined
  opts.debounceRendering = (cb) => {
    flush = cb
  }
  try {
    const result = fn()
    flush?.()
    return result
  } finally {
    opts.debounceRendering = prevDebounce
  }
}
