import {
  GridVirtualizer,
  ListVirtualizer,
  WaterfallVirtualizer,
  WindowVirtualizer,
  type GridVirtualizerOptions,
  type ListVirtualizerOptions,
  type WaterfallVirtualizerOptions,
  type WindowVirtualizerOptions,
} from "@zag-js/virtualizer"
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react"

interface VirtualizerLike<O> {
  subscribe: (listener: () => void) => () => void
  getSnapshot: () => number
  init: (element: HTMLElement) => void
  destroy: () => void
  updateOptions: (options: Partial<O>) => void
}

// One level deep, so `groups: [{ id, startIndex }]` rebuilt each render isn't a change
const isEqual = (a: unknown, b: unknown): boolean => {
  if (Object.is(a, b)) return true
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return false
  if (Array.isArray(a)) return Array.isArray(b) && a.length === b.length && a.every((v, i) => isEqual(v, b[i]))
  const keys = Object.keys(a)
  return keys.length === Object.keys(b).length && keys.every((k) => Object.is((a as any)[k], (b as any)[k]))
}

function useVirtualizer<O extends object, V extends VirtualizerLike<O>>(create: (options: O) => V, options: O) {
  const latest = useRef(options)
  latest.current = options

  // Function options always call the latest render's version, so inline callbacks are fine
  const [virtualizer] = useState(() => {
    const wrapped = { ...options } as Record<string, unknown>
    for (const key in wrapped) {
      if (typeof wrapped[key] === "function") {
        wrapped[key] = (...args: unknown[]) => (latest.current as any)[key](...args)
      }
    }
    return create(wrapped as O)
  })

  useSyncExternalStore(virtualizer.subscribe, virtualizer.getSnapshot, () => 0)

  // Before paint, so a new `count` never renders stale rows
  const synced = useRef(options)
  useLayoutEffect(() => {
    const changed: Partial<O> = {}
    let dirty = false
    for (const key in options) {
      const value = options[key]
      if (typeof value === "function" || isEqual(value, synced.current[key])) continue
      changed[key] = value
      dirty = true
    }
    synced.current = options
    if (dirty) virtualizer.updateOptions(changed)
  })

  const ref = useCallback(
    (el: HTMLElement | null) => {
      if (el) virtualizer.init(el)
    },
    [virtualizer],
  )

  useEffect(() => () => virtualizer.destroy(), [virtualizer])

  return { virtualizer, ref }
}

export function useListVirtualizer(options: ListVirtualizerOptions) {
  return useVirtualizer((o) => new ListVirtualizer(o), options)
}

export function useWindowVirtualizer(options: WindowVirtualizerOptions) {
  return useVirtualizer((o) => new WindowVirtualizer(o), options)
}

export function useGridVirtualizer(options: GridVirtualizerOptions) {
  return useVirtualizer((o) => new GridVirtualizer(o), options)
}

export function useWaterfallVirtualizer(options: WaterfallVirtualizerOptions) {
  return useVirtualizer((o) => new WaterfallVirtualizer(o), options)
}
