import {
  GridVirtualizer,
  ListVirtualizer,
  TableVirtualizer,
  WaterfallVirtualizer,
  WindowVirtualizer,
  type GridVirtualizerOptions,
  type ListVirtualizerOptions,
  type TableVirtualizerOptions,
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

interface HookOptions {
  /** Set `false` to render every item */
  enabled?: boolean
}

const withEnabled = <O extends object>({ enabled = true, ...options }: O & HookOptions): O =>
  (enabled ? options : { ...options, overscan: Infinity }) as O

interface Measurable {
  getTotalSize?: () => number
  getTotalHeight?: () => number
}

const getRootAttrs = (virtualizer: Measurable, options: { count?: number; rowCount?: number }) => ({
  empty: (options.count ?? options.rowCount) === 0,
  totalSize: `${virtualizer.getTotalSize?.() ?? virtualizer.getTotalHeight?.() ?? 0}px`,
})

// One level deep, so a rebuilt `groups` array isn't a change
const isEqual = (a: unknown, b: unknown): boolean => {
  if (Object.is(a, b)) return true
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return false
  if (Array.isArray(a)) return Array.isArray(b) && a.length === b.length && a.every((v, i) => isEqual(v, b[i]))
  const keys = Object.keys(a)
  return keys.length === Object.keys(b).length && keys.every((k) => Object.is((a as any)[k], (b as any)[k]))
}

function useVirtualizer<O extends object, V extends VirtualizerLike<O>>(
  create: (options: O) => V,
  hookOptions: O & HookOptions,
) {
  const options = withEnabled(hookOptions)
  const [virtualizer] = useState(() => create(options))
  useSyncExternalStore(virtualizer.subscribe, virtualizer.getSnapshot, () => 0)

  // Sync changed options before paint; keep function options stable (useCallback)
  const synced = useRef(options)
  useLayoutEffect(() => {
    const changed: Partial<O> = {}
    let dirty = false
    for (const key in options) {
      const value = options[key]
      if (isEqual(value, synced.current[key])) continue
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

  const { empty, totalSize } = getRootAttrs(virtualizer as Measurable, options)
  const rootProps = { "data-empty": empty ? "" : undefined, style: { "--total-size": totalSize } }

  return { virtualizer, ref, rootProps }
}

export function useListVirtualizer(options: ListVirtualizerOptions & HookOptions) {
  return useVirtualizer((o) => new ListVirtualizer(o), options)
}

export function useWindowVirtualizer(options: WindowVirtualizerOptions & HookOptions) {
  return useVirtualizer((o) => new WindowVirtualizer(o), options)
}

export function useGridVirtualizer(options: GridVirtualizerOptions & HookOptions) {
  return useVirtualizer((o) => new GridVirtualizer(o), options)
}

export function useWaterfallVirtualizer(options: WaterfallVirtualizerOptions & HookOptions) {
  return useVirtualizer((o) => new WaterfallVirtualizer(o), options)
}

export function useTableVirtualizer(options: TableVirtualizerOptions & HookOptions) {
  return useVirtualizer((o) => new TableVirtualizer(o), options)
}
