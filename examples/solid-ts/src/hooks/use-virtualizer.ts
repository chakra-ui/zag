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
import { onCleanup, onMount } from "solid-js"

interface VirtualizerLike {
  subscribe: (listener: () => void) => () => void
  getSnapshot: () => number
  destroy: () => void
  init: (element: HTMLElement) => void
}

function useVirtualizerStore<T extends VirtualizerLike>(create: () => T) {
  const inner = create()
  const snapshot = useSyncExternalStore(inner.subscribe, inner.getSnapshot)

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
  }) as T

  const ref = (el: HTMLElement | null) => {
    scrollElement = el
    if (mounted && el) inner.init(el)
  }

  return { virtualizer, ref }
}

export function useListVirtualizer(options: ListVirtualizerOptions) {
  return useVirtualizerStore(() => new ListVirtualizer(options))
}

export function useGridVirtualizer(options: GridVirtualizerOptions) {
  return useVirtualizerStore(() => new GridVirtualizer(options))
}

export function useWindowVirtualizer(options: WindowVirtualizerOptions) {
  return useVirtualizerStore(() => new WindowVirtualizer(options))
}

export function useWaterfallVirtualizer(options: WaterfallVirtualizerOptions) {
  return useVirtualizerStore(() => new WaterfallVirtualizer(options))
}
