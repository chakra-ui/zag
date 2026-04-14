import {
  GridVirtualizer,
  ListVirtualizer,
  WindowVirtualizer,
  type GridVirtualizerOptions,
  type ListVirtualizerOptions,
  type WindowVirtualizerOptions,
} from "@zag-js/virtualizer"
import { useCallback, useEffect, useState, useSyncExternalStore } from "react"

export function useListVirtualizer(options: ListVirtualizerOptions) {
  const [virtualizer] = useState(() => new ListVirtualizer(options))
  useSyncExternalStore(virtualizer.subscribe, virtualizer.getSnapshot, () => 0)

  const ref = useCallback(
    (el: HTMLElement | null) => {
      if (!el) return
      virtualizer.init(el)
    },
    [virtualizer],
  )

  useEffect(() => {
    return () => virtualizer.destroy()
  }, [])

  return { virtualizer, ref }
}

export function useWindowVirtualizer(options: WindowVirtualizerOptions) {
  const [virtualizer] = useState(() => new WindowVirtualizer(options))
  useSyncExternalStore(virtualizer.subscribe, virtualizer.getSnapshot, () => 0)

  const ref = useCallback(
    (el: HTMLElement | null) => {
      if (!el) return
      virtualizer.init(el)
    },
    [virtualizer],
  )

  useEffect(() => {
    return () => virtualizer.destroy()
  }, [virtualizer])

  return { virtualizer, ref }
}

export function useGridVirtualizer(options: GridVirtualizerOptions) {
  const [virtualizer] = useState(() => new GridVirtualizer(options))

  useSyncExternalStore(virtualizer.subscribe, virtualizer.getSnapshot, () => 0)

  const ref = useCallback(
    (el: HTMLElement | null) => {
      if (!el) return
      virtualizer.init(el)
    },
    [virtualizer],
  )

  useEffect(() => {
    return () => virtualizer.destroy()
  }, [])

  return { virtualizer, ref }
}
