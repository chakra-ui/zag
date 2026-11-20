import { normalizeProps, type PropTypes, useSyncExternalStore } from "@zag-js/solid"
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
import { type Accessor, createEffect, createMemo, createUniqueId, onCleanup, onSettled, untrack } from "solid-js"

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

type Options<O> = Omit<O, "id" | "normalizeProps"> & HookOptions
type MaybeAccessor<T> = T | Accessor<T>

const withEnabled = <O extends object>({ enabled = true, ...options }: O & HookOptions): O =>
  (enabled ? options : { ...options, overscan: Infinity }) as O

function useVirtualizer<O extends object, V extends VirtualizerLike<O>>(
  create: (options: O) => V,
  options: MaybeAccessor<Options<O>>,
) {
  const read = () => withEnabled((typeof options === "function" ? options() : options) as O & HookOptions)
  const inner = create({ ...untrack(read), id: createUniqueId(), normalizeProps })
  const snapshot = useSyncExternalStore(inner.subscribe, inner.getSnapshot)

  // Unchanged options and new callbacks don't re-render
  createEffect(read, (next) => inner.updateOptions(next))

  // The same instance, re-read by dependents on every change
  const virtualizer = createMemo(() => (snapshot(), inner), { equals: false })

  let scrollElement: HTMLElement | null = null
  let mounted = false

  onSettled(() => {
    mounted = true
    if (scrollElement) inner.init(scrollElement)
  })

  onCleanup(() => inner.destroy())

  const ref = (element: HTMLElement | null) => {
    scrollElement = element
    if (mounted && element) inner.init(element)
  }

  return { virtualizer, ref }
}

export const useListVirtualizer = (options: MaybeAccessor<Options<ListVirtualizerOptions>>) =>
  useVirtualizer((o) => new ListVirtualizer<PropTypes>(o), options)

export const useGridVirtualizer = (options: MaybeAccessor<Options<GridVirtualizerOptions>>) =>
  useVirtualizer((o) => new GridVirtualizer<PropTypes>(o), options)

export const useWindowVirtualizer = (options: MaybeAccessor<Options<WindowVirtualizerOptions>>) =>
  useVirtualizer((o) => new WindowVirtualizer<PropTypes>(o), options)

export const useWaterfallVirtualizer = (options: MaybeAccessor<Options<WaterfallVirtualizerOptions>>) =>
  useVirtualizer((o) => new WaterfallVirtualizer<PropTypes>(o), options)

export const useTableVirtualizer = (options: MaybeAccessor<Options<TableVirtualizerOptions>>) =>
  useVirtualizer((o) => new TableVirtualizer<PropTypes>(o), options)
