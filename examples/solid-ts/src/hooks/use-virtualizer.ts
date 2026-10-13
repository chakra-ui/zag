import { useSyncExternalStore } from "@zag-js/solid"
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
import { createEffect, onCleanup, onMount, untrack, type Accessor } from "solid-js"

interface VirtualizerLike<O> {
  subscribe: (listener: () => void) => () => void
  getSnapshot: () => number
  destroy: () => void
  init: (element: HTMLElement) => void
  updateOptions: (options: Partial<O>) => void
}

type MaybeAccessor<T> = T | Accessor<T>

// One level deep, so a rebuilt `groups: [{ id, startIndex }]` isn't a change
const isEqual = (a: unknown, b: unknown): boolean => {
  if (Object.is(a, b)) return true
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return false
  if (Array.isArray(a)) return Array.isArray(b) && a.length === b.length && a.every((v, i) => isEqual(v, b[i]))
  const keys = Object.keys(a)
  return keys.length === Object.keys(b).length && keys.every((k) => Object.is((a as any)[k], (b as any)[k]))
}

function useVirtualizer<O extends object, V extends VirtualizerLike<O>>(
  create: (options: O) => V,
  options: MaybeAccessor<O>,
) {
  const read = () => (typeof options === "function" ? (options as Accessor<O>)() : options)
  let latest = untrack(read)

  // Function options always call the latest version
  const wrapped = { ...latest } as Record<string, unknown>
  for (const key in wrapped) {
    if (typeof wrapped[key] === "function") {
      wrapped[key] = (...args: unknown[]) => (latest as any)[key](...args)
    }
  }
  const inner = create(wrapped as O)
  const snapshot = useSyncExternalStore(inner.subscribe, inner.getSnapshot)

  // Re-runs when the options accessor's dependencies change
  createEffect(() => {
    const next = read()
    const changed: Partial<O> = {}
    let dirty = false
    for (const key in next) {
      const value = next[key]
      if (typeof value === "function" || isEqual(value, latest[key])) continue
      changed[key] = value
      dirty = true
    }
    latest = next
    // untrack: reading the virtualizer would subscribe this effect to it
    if (dirty) untrack(() => inner.updateOptions(changed))
  })

  let scrollElement: HTMLElement | null = null
  let mounted = false

  onMount(() => {
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

  return { virtualizer, ref }
}

export function useListVirtualizer(options: MaybeAccessor<ListVirtualizerOptions>) {
  return useVirtualizer((o) => new ListVirtualizer(o), options)
}

export function useGridVirtualizer(options: MaybeAccessor<GridVirtualizerOptions>) {
  return useVirtualizer((o) => new GridVirtualizer(o), options)
}

export function useWindowVirtualizer(options: MaybeAccessor<WindowVirtualizerOptions>) {
  return useVirtualizer((o) => new WindowVirtualizer(o), options)
}

export function useWaterfallVirtualizer(options: MaybeAccessor<WaterfallVirtualizerOptions>) {
  return useVirtualizer((o) => new WaterfallVirtualizer(o), options)
}
