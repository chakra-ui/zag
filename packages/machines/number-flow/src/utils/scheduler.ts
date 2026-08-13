/**
 * Module-level singletons shared by every `number-flow` instance on the page (§9.4, §9.9).
 *
 * Batches transform writes into a single rAF per frame regardless of how many tickers are
 * mounted, and reads `prefers-reduced-motion` from one shared `MediaQueryList`.
 */

import { AnimationFrame } from "@zag-js/dom-query"

type Task = () => void

function createWriteScheduler() {
  let scheduledTasks: Map<unknown, Task> | null = null
  const frame = AnimationFrame.create()

  function flush() {
    const tasks = scheduledTasks
    scheduledTasks = null
    tasks?.forEach((task) => task())
  }

  return {
    /** Schedules `task` to run in the next shared write phase. Re-scheduling the same `key` retargets it. */
    schedule(key: unknown, task: Task): void {
      scheduledTasks ??= new Map()
      scheduledTasks.set(key, task)

      if (frame.isActive()) return
      frame.request(flush)
    },

    cancel(key: unknown): void {
      scheduledTasks?.delete(key)
    },

    /** Test-only escape hatch: forces the pending write phase to run synchronously. */
    flushSync(): void {
      if (frame.isActive()) frame.cancel()
      flush()
    },
  }
}

const writeScheduler = createWriteScheduler()

export const scheduleWrite = writeScheduler.schedule
export const cancelScheduledWrite = writeScheduler.cancel
export const __flushScheduledWrites = writeScheduler.flushSync

type ReducedMotionListener = (matches: boolean) => void

function createReducedMotionTracker() {
  let mediaQueryList: MediaQueryList | null = null
  let matches = false
  const listeners = new Set<ReducedMotionListener>()

  function handleChange(event: MediaQueryListEvent) {
    matches = event.matches
    listeners.forEach((listener) => listener(matches))
  }

  return {
    /** Subscribes to `prefers-reduced-motion`, lazily creating one shared listener per page. */
    subscribe(win: Window, listener: ReducedMotionListener): VoidFunction {
      if (!mediaQueryList && typeof win.matchMedia === "function") {
        mediaQueryList = win.matchMedia("(prefers-reduced-motion: reduce)")
        matches = mediaQueryList.matches
        mediaQueryList.addEventListener("change", handleChange)
      }

      listener(matches)
      listeners.add(listener)

      return () => {
        listeners.delete(listener)
      }
    },
  }
}

const reducedMotionTracker = createReducedMotionTracker()

export const trackReducedMotion = reducedMotionTracker.subscribe
