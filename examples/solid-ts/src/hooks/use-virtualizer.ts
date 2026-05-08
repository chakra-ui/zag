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
import { createSignal, onCleanup, onMount } from "solid-js"

type VirtualizerWithStore<T> = T & {
  subscribe: (listener: () => void) => () => void
  destroy: () => void
  getSnapshot: () => number
}

function useVirtualizerStore<T extends VirtualizerWithStore<object>>(createVirtualizer: () => T) {
  const virtualizer = createVirtualizer()
  const [version, setVersion] = createSignal(virtualizer.getSnapshot())
  const unsubscribe = virtualizer.subscribe(() => setVersion(virtualizer.getSnapshot()))

  onCleanup(() => {
    unsubscribe()
    virtualizer.destroy()
  })

  return { virtualizer, version }
}

export function useListVirtualizer(options: ListVirtualizerOptions) {
  const { virtualizer, version } = useVirtualizerStore(() => new ListVirtualizer(options))
  let scrollElement: HTMLElement | null = null
  let mounted = false

  onMount(() => {
    mounted = true
    if (scrollElement) virtualizer.init(scrollElement)
  })

  const ref = (el: HTMLElement | null) => {
    scrollElement = el
    if (mounted && el) virtualizer.init(el)
  }
  return { virtualizer, ref, version }
}

export function useGridVirtualizer(options: GridVirtualizerOptions) {
  const { virtualizer, version } = useVirtualizerStore(() => new GridVirtualizer(options))
  let scrollElement: HTMLElement | null = null
  let mounted = false

  onMount(() => {
    mounted = true
    if (scrollElement) virtualizer.init(scrollElement)
  })

  const ref = (el: HTMLElement | null) => {
    scrollElement = el
    if (mounted && el) virtualizer.init(el)
  }
  return { virtualizer, ref, version }
}

export function useWindowVirtualizer(options: WindowVirtualizerOptions) {
  const { virtualizer, version } = useVirtualizerStore(() => new WindowVirtualizer(options))
  let scrollElement: HTMLElement | null = null
  let mounted = false

  onMount(() => {
    mounted = true
    if (scrollElement) virtualizer.init(scrollElement)
  })

  const ref = (el: HTMLElement | null) => {
    scrollElement = el
    if (mounted && el) virtualizer.init(el)
  }
  return { virtualizer, ref, version }
}

export function useWaterfallVirtualizer(options: WaterfallVirtualizerOptions) {
  const { virtualizer, version } = useVirtualizerStore(() => new WaterfallVirtualizer(options))
  let scrollElement: HTMLElement | null = null
  let mounted = false

  onMount(() => {
    mounted = true
    if (scrollElement) virtualizer.init(scrollElement)
  })

  const ref = (el: HTMLElement | null) => {
    scrollElement = el
    if (mounted && el) virtualizer.init(el)
  }
  return { virtualizer, ref, version }
}
