import { useSyncExternalStore } from "@zag-js/vue"
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
import { toValue, watch, type MaybeRefOrGetter } from "vue"

interface VirtualizerLike<O> {
  subscribe: (listener: () => void) => () => void
  getSnapshot: () => number
  destroy: () => void
  init: (element: HTMLElement) => void
  updateOptions: (options: Partial<O>) => void
}

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
  options: MaybeRefOrGetter<O>,
) {
  let latest = toValue(options)
  const inner = create(latest)
  const snapshot = useSyncExternalStore(inner.subscribe, inner.getSnapshot)

  // Syncs changed options whenever the getter's dependencies change
  watch(
    () => toValue(options),
    (next) => {
      const changed: Partial<O> = {}
      let dirty = false
      for (const key in next) {
        if (isEqual(next[key], latest[key])) continue
        changed[key] = next[key]
        dirty = true
      }
      latest = next
      if (dirty) inner.updateOptions(changed)
    },
  )

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

  return { virtualizer, init }
}

export function useListVirtualizer(options: MaybeRefOrGetter<ListVirtualizerOptions>) {
  return useVirtualizer((o) => new ListVirtualizer(o), options)
}

export function useGridVirtualizer(options: MaybeRefOrGetter<GridVirtualizerOptions>) {
  return useVirtualizer((o) => new GridVirtualizer(o), options)
}

export function useWindowVirtualizer(options: MaybeRefOrGetter<WindowVirtualizerOptions>) {
  return useVirtualizer((o) => new WindowVirtualizer(o), options)
}

export function useWaterfallVirtualizer(options: MaybeRefOrGetter<WaterfallVirtualizerOptions>) {
  return useVirtualizer((o) => new WaterfallVirtualizer(o), options)
}
