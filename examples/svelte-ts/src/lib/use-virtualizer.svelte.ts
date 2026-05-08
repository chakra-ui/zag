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

export function useListVirtualizer(options: ListVirtualizerOptions) {
  const virtualizer = new ListVirtualizer(options)

  let items = $state(virtualizer.getVirtualItems())
  let totalSize = $state(virtualizer.getTotalSize())

  const unsubscribe = virtualizer.subscribe(() => {
    items = virtualizer.getVirtualItems()
    totalSize = virtualizer.getTotalSize()
  })

  onDestroy(() => {
    unsubscribe()
    virtualizer.destroy()
  })

  return {
    virtualizer,
    init(element: HTMLElement | null) {
      if (!element) return
      virtualizer.init(element)
    },
    get items() {
      return items
    },
    get totalSize() {
      return totalSize
    },
  }
}

export function useGridVirtualizer(options: GridVirtualizerOptions) {
  const virtualizer = new GridVirtualizer(options)

  let rows = $state(virtualizer.getVirtualRows())
  let totalHeight = $state(virtualizer.getTotalHeight())
  let totalWidth = $state(virtualizer.getTotalWidth())

  const unsubscribe = virtualizer.subscribe(() => {
    rows = virtualizer.getVirtualRows()
    totalHeight = virtualizer.getTotalHeight()
    totalWidth = virtualizer.getTotalWidth()
  })

  onDestroy(() => {
    unsubscribe()
    virtualizer.destroy()
  })

  return {
    virtualizer,
    init(element: HTMLElement | null) {
      if (!element) return
      virtualizer.init(element)
    },
    get rows() {
      return rows
    },
    get totalHeight() {
      return totalHeight
    },
    get totalWidth() {
      return totalWidth
    },
  }
}

export function useWindowVirtualizer(options: WindowVirtualizerOptions) {
  const virtualizer = new WindowVirtualizer(options)

  let items = $state(virtualizer.getVirtualItems())
  let totalSize = $state(virtualizer.getTotalSize())

  const unsubscribe = virtualizer.subscribe(() => {
    items = virtualizer.getVirtualItems()
    totalSize = virtualizer.getTotalSize()
  })

  onDestroy(() => {
    unsubscribe()
    virtualizer.destroy()
  })

  return {
    virtualizer,
    init(element: HTMLElement | null) {
      if (!element) return
      virtualizer.init(element)
    },
    get items() {
      return items
    },
    get totalSize() {
      return totalSize
    },
  }
}

export function useWaterfallVirtualizer(options: WaterfallVirtualizerOptions) {
  const virtualizer = new WaterfallVirtualizer(options)

  let items = $state(virtualizer.getVirtualItems())
  let totalSize = $state(virtualizer.getTotalSize())
  let waterfallState = $state(virtualizer.getWaterfallState())

  const unsubscribe = virtualizer.subscribe(() => {
    items = virtualizer.getVirtualItems()
    totalSize = virtualizer.getTotalSize()
    waterfallState = virtualizer.getWaterfallState()
  })

  onDestroy(() => {
    unsubscribe()
    virtualizer.destroy()
  })

  return {
    virtualizer,
    init(element: HTMLElement | null) {
      if (!element) return
      virtualizer.init(element)
    },
    get items() {
      return items
    },
    get totalSize() {
      return totalSize
    },
    get waterfallState() {
      return waterfallState
    },
  }
}
