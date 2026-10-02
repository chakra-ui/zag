import { flush, untrack } from "solid-js"

let queueDepth = 0

/**
 * Runs `fn` inside a Solid queue callback (`onSettled`, effect apply phase).
 * Solid 2 does not allow draining the queue there: writes made in `fn` are processed
 * in the continuation of the flush that is already running.
 * Machine code reads state imperatively, so reads are untracked.
 */
export function runInQueue<T>(fn: () => T): T {
  queueDepth++
  try {
    return untrack(fn)
  } finally {
    queueDepth--
  }
}

/**
 * Runs `fn` and applies its signal writes synchronously, like 1.x did.
 * Solid 2 batches writes until the next microtask otherwise.
 */
export function flushSync(fn: VoidFunction) {
  if (queueDepth > 0) fn()
  else flush(fn)
}
