import { useSyncExternalStore } from "@zag-js/svelte"
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
import { onDestroy } from "svelte"

interface VirtualizerLike {
  subscribe: (listener: () => void) => () => void
  getSnapshot: () => number
  destroy: () => void
  init: (element: HTMLElement) => void
}

function useVirtualizerStore<T extends VirtualizerLike>(create: () => T) {
  const inner = create()
  const snapshot = useSyncExternalStore(inner.subscribe, inner.getSnapshot)

  onDestroy(() => inner.destroy())

  // Reading any property on the proxy registers a dep on `snapshot`,
  // so template bindings like virtualizer.getVirtualItems() re-track on every notify.
  const virtualizer = new Proxy(inner, {
    get(target, prop, receiver) {
      snapshot()
      const value = Reflect.get(target, prop, receiver)
      return typeof value === "function" ? value.bind(target) : value
    },
  }) as T

  const init = (element: HTMLElement | null) => {
    if (!element) return
    inner.init(element)
  }

  return { virtualizer, init }
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
