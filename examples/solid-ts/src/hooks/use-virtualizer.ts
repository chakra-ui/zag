import { useSyncExternalStore } from "@zag-js/solid"
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
import { onCleanup, onSettled, untrack, type Accessor, createTrackedEffect } from "solid-js"

interface VirtualizerLike<O> {
  subscribe: (listener: () => void) => () => void
  getSnapshot: () => number
  destroy: () => void
  init: (element: HTMLElement) => void
  updateOptions: (options: Partial<O>) => void
}

type MaybeAccessor<T> = T | Accessor<T>

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
  options: MaybeAccessor<O & HookOptions>,
) {
  const read = () => withEnabled(typeof options === "function" ? (options as Accessor<O & HookOptions>)() : options)
  let latest = untrack(read)
  const inner = create(latest)
  const snapshot = useSyncExternalStore(inner.subscribe, inner.getSnapshot)

  // Syncs changed options whenever the accessor re-runs
  createTrackedEffect(() => {
    const next = read()
    const changed: Partial<O> = {}
    let dirty = false
    for (const key in next) {
      const value = next[key]
      if (isEqual(value, latest[key])) continue
      changed[key] = value
      dirty = true
    }
    latest = next
    // untrack: reading the virtualizer would subscribe this effect to it
    if (dirty) untrack(() => inner.updateOptions(changed))
  })

  let scrollElement: HTMLElement | null = null
  let mounted = false

  onSettled(() => {
    mounted = true
    if (scrollElement) inner.init(scrollElement)
  })

  onCleanup(() => inner.destroy())

  // Reading any property on the proxy registers a dep on `snapshot`,
  // so JSX bindings like virtualizer.getVirtualItems() re-track on every notify.
  const virtualizer = new Proxy(inner, {
    get(target, prop, receiver) {
      snapshot()
      const value = Reflect.get(target, prop, receiver)
      return typeof value === "function" ? value.bind(target) : value
    },
  }) as V

  const ref = (el: HTMLElement | null) => {
    scrollElement = el
    if (mounted && el) inner.init(el)
  }

  const getRootProps = () => {
    const { empty, totalSize } = getRootAttrs(virtualizer as Measurable, read())
    return { "data-empty": empty ? "" : undefined, style: { "--total-size": totalSize } }
  }

  return { virtualizer, ref, getRootProps }
}

export function useListVirtualizer(options: MaybeAccessor<ListVirtualizerOptions & HookOptions>) {
  return useVirtualizer((o) => new ListVirtualizer(o), options)
}

export function useGridVirtualizer(options: MaybeAccessor<GridVirtualizerOptions & HookOptions>) {
  return useVirtualizer((o) => new GridVirtualizer(o), options)
}

export function useWindowVirtualizer(options: MaybeAccessor<WindowVirtualizerOptions & HookOptions>) {
  return useVirtualizer((o) => new WindowVirtualizer(o), options)
}

export function useWaterfallVirtualizer(options: MaybeAccessor<WaterfallVirtualizerOptions & HookOptions>) {
  return useVirtualizer((o) => new WaterfallVirtualizer(o), options)
}

export function useTableVirtualizer(options: MaybeAccessor<TableVirtualizerOptions & HookOptions>) {
  return useVirtualizer((o) => new TableVirtualizer(o), options)
}
