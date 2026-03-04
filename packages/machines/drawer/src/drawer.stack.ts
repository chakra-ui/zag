import type { NormalizeProps, PropTypes } from "@zag-js/types"
import type { DrawerStack, DrawerStackApi, DrawerStackSnapshot } from "./drawer.types"

type DrawerEntry = {
  order: number
  open: boolean
  height: number
  swiping: boolean
  swipeProgress: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function resolveSnapshot(entries: Map<string, DrawerEntry>): DrawerStackSnapshot {
  let openCount = 0
  let frontmostHeight = 0
  let swipeProgress = 0
  let frontmostOrder = -1

  entries.forEach((entry) => {
    if (!entry.open) return
    openCount += 1
    if (entry.order < frontmostOrder) return

    frontmostOrder = entry.order
    frontmostHeight = entry.height > 0 ? entry.height : 0
    swipeProgress = entry.swiping ? clamp(entry.swipeProgress, 0, 1) : 0
  })

  return {
    active: openCount > 0,
    openCount,
    swipeProgress,
    frontmostHeight,
  }
}

export function createStack(): DrawerStack {
  const entries = new Map<string, DrawerEntry>()
  const listeners = new Set<() => void>()
  let order = 0
  let pendingNotify = false
  let snapshot: DrawerStackSnapshot = Object.freeze({
    active: false,
    openCount: 0,
    swipeProgress: 0,
    frontmostHeight: 0,
  })

  const scheduleNotify = () => {
    if (pendingNotify) return
    pendingNotify = true
    queueMicrotask(() => {
      pendingNotify = false
      listeners.forEach((listener) => listener())
    })
  }

  const notify = () => {
    const nextSnapshot = resolveSnapshot(entries)
    if (
      snapshot.active === nextSnapshot.active &&
      snapshot.openCount === nextSnapshot.openCount &&
      snapshot.swipeProgress === nextSnapshot.swipeProgress &&
      snapshot.frontmostHeight === nextSnapshot.frontmostHeight
    ) {
      return
    }

    snapshot = Object.freeze(nextSnapshot)
    scheduleNotify()
  }

  const ensureEntry = (id: string): DrawerEntry => {
    let entry = entries.get(id)
    if (!entry) {
      entry = { order: ++order, open: false, height: 0, swiping: false, swipeProgress: 0 }
      entries.set(id, entry)
    }
    return entry
  }

  return {
    getSnapshot() {
      return snapshot
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    register(id) {
      ensureEntry(id)
      notify()
    },
    unregister(id) {
      if (!entries.delete(id)) return
      notify()
    },
    setOpen(id, open) {
      const entry = ensureEntry(id)
      if (entry.open === open) return
      entry.open = open
      if (!open) {
        entry.swiping = false
        entry.swipeProgress = 0
      }
      notify()
    },
    setHeight(id, height) {
      const entry = ensureEntry(id)
      const nextHeight = Number.isFinite(height) && height > 0 ? height : 0
      if (entry.height === nextHeight) return
      entry.height = nextHeight
      notify()
    },
    setSwipe(id, swiping, progress) {
      const entry = ensureEntry(id)
      const nextProgress = swiping ? clamp(Number.isFinite(progress) ? progress : 0, 0, 1) : 0
      if (entry.swiping === swiping && entry.swipeProgress === nextProgress) return
      entry.swiping = swiping
      entry.swipeProgress = nextProgress
      notify()
    },
  }
}

export function connectStack<T extends PropTypes>(
  snapshot: DrawerStackSnapshot,
  normalize: NormalizeProps<T>,
): DrawerStackApi<T> {
  const getIndentProps = () => {
    return normalize.element({
      "data-active": snapshot.active ? "" : undefined,
      "data-inactive": snapshot.active ? undefined : "",
      style: {
        "--drawer-swipe-progress": `${clamp(snapshot.swipeProgress, 0, 1)}`,
        "--drawer-frontmost-height": snapshot.frontmostHeight > 0 ? `${snapshot.frontmostHeight}px` : undefined,
      },
    })
  }

  return {
    getIndentProps,
    getIndentBackgroundProps: getIndentProps,
  }
}
