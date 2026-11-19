import { useSyncExternalStore } from "@zag-js/vue"
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
import { toValue, watch, type MaybeRefOrGetter } from "vue"

interface VirtualizerLike<O> {
  subscribe: (listener: () => void) => () => void
  getSnapshot: () => number
  destroy: () => void
  init: (element: HTMLElement) => void
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
  options: MaybeRefOrGetter<O & HookOptions>,
) {
  const read = () => withEnabled(toValue(options))
  let latest = read()
  const inner = create(latest)
  const snapshot = useSyncExternalStore(inner.subscribe, inner.getSnapshot)

  // Syncs changed options whenever the getter's dependencies change
  watch(read, (next) => {
    const changed: Partial<O> = {}
    let dirty = false
    for (const key in next) {
      if (isEqual(next[key], latest[key])) continue
      changed[key] = next[key]
      dirty = true
    }
    latest = next
    if (dirty) inner.updateOptions(changed)
  })

  onUnmounted(() => inner.destroy())

  // Reading any property on the proxy registers a dep on `snapshot`,
  // so template bindings like virtualizer.getVirtualItems() re-track on every notify.
  const virtualizer = new Proxy(inner, {
    get(target, prop, receiver) {
      void snapshot.value
      const value = Reflect.get(target, prop, receiver)
      return typeof value === "function" ? value.bind(target) : value
    },
  }) as V

  // Function refs run on every render; only (re)initialise for a new element
  let current: HTMLElement | null = null
  const init = (element: HTMLElement | null) => {
    if (!element || element === current) return
    current = element
    inner.init(element)
  }

  const getRootProps = () => {
    const { empty, totalSize } = getRootAttrs(virtualizer as Measurable, latest)
    return { "data-empty": empty ? "" : undefined, style: { "--total-size": totalSize } }
  }

  return { virtualizer, init, getRootProps }
}

export function useListVirtualizer(options: MaybeRefOrGetter<ListVirtualizerOptions & HookOptions>) {
  return useVirtualizer((o) => new ListVirtualizer(o), options)
}

export function useGridVirtualizer(options: MaybeRefOrGetter<GridVirtualizerOptions & HookOptions>) {
  return useVirtualizer((o) => new GridVirtualizer(o), options)
}

export function useWindowVirtualizer(options: MaybeRefOrGetter<WindowVirtualizerOptions & HookOptions>) {
  return useVirtualizer((o) => new WindowVirtualizer(o), options)
}

export function useWaterfallVirtualizer(options: MaybeRefOrGetter<WaterfallVirtualizerOptions & HookOptions>) {
  return useVirtualizer((o) => new WaterfallVirtualizer(o), options)
}

export function useTableVirtualizer(options: MaybeRefOrGetter<TableVirtualizerOptions & HookOptions>) {
  return useVirtualizer((o) => new TableVirtualizer(o), options)
}
