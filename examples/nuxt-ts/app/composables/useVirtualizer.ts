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

type VirtualizerLike = {
  subscribe: (listener: () => void) => () => void
  destroy: () => void
  init: (element: HTMLElement) => void
}

function useVirtualizerStore<T extends VirtualizerLike>(createVirtualizer: () => T) {
  const virtualizer = createVirtualizer()
  const version = ref(0)
  const unsubscribe = virtualizer.subscribe(() => {
    version.value += 1
  })

  onUnmounted(() => {
    unsubscribe()
    virtualizer.destroy()
  })

  const init = (element: HTMLElement | null) => {
    if (!element) return
    virtualizer.init(element)
  }

  return { virtualizer, version, init }
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
