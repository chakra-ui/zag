import { normalizeProps, type PropTypes } from "@zag-js/react"
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
import { useCallback, useEffect, useId, useLayoutEffect, useState, useSyncExternalStore } from "react"

interface VirtualizerLike<O> {
  subscribe: (listener: () => void) => () => void
  getSnapshot: () => number
  init: (element: HTMLElement) => void
  destroy: () => void
  updateOptions: (options: Partial<O>) => void
}

interface HookOptions {
  /** Set `false` to render every item */
  enabled?: boolean
}

type Options<O> = Omit<O, "id" | "normalizeProps"> & HookOptions

const withEnabled = <O extends object>({ enabled = true, ...options }: O & HookOptions): O =>
  (enabled ? options : { ...options, overscan: Infinity }) as O

function useVirtualizer<O extends object, V extends VirtualizerLike<O>>(
  create: (options: O) => V,
  hookOptions: Options<O>,
) {
  const id = useId()
  const options = withEnabled(hookOptions as O & HookOptions)
  const [virtualizer] = useState(() => create({ ...options, id, normalizeProps }))
  useSyncExternalStore(virtualizer.subscribe, virtualizer.getSnapshot, virtualizer.getSnapshot)

  // Synced before paint; unchanged options and new callbacks don't re-render
  useLayoutEffect(() => virtualizer.updateOptions(options))

  const ref = useCallback(
    (element: HTMLElement | null) => {
      if (element) virtualizer.init(element)
    },
    [virtualizer],
  )
  useEffect(() => () => virtualizer.destroy(), [virtualizer])

  return { virtualizer, ref }
}

export const useListVirtualizer = (options: Options<ListVirtualizerOptions>) =>
  useVirtualizer((o) => new ListVirtualizer<PropTypes>(o), options)

export const useWindowVirtualizer = (options: Options<WindowVirtualizerOptions>) =>
  useVirtualizer((o) => new WindowVirtualizer<PropTypes>(o), options)

export const useGridVirtualizer = (options: Options<GridVirtualizerOptions>) =>
  useVirtualizer((o) => new GridVirtualizer<PropTypes>(o), options)

export const useWaterfallVirtualizer = (options: Options<WaterfallVirtualizerOptions>) =>
  useVirtualizer((o) => new WaterfallVirtualizer<PropTypes>(o), options)

export const useTableVirtualizer = (options: Options<TableVirtualizerOptions>) =>
  useVirtualizer((o) => new TableVirtualizer<PropTypes>(o), options)
