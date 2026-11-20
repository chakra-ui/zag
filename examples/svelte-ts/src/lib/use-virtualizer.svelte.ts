import { normalizeProps, type PropTypes } from "@zag-js/svelte"
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
import { onDestroy, untrack } from "svelte"

interface VirtualizerLike<O> {
  subscribe: (listener: () => void) => () => void
  destroy: () => void
  init: (element: HTMLElement) => void
  updateOptions: (options: Partial<O>) => void
}

interface HookOptions {
  /** Set `false` to render every item */
  enabled?: boolean
}

/** Pass `id` from `$props.id()` so server-rendered markup matches */
type Options<O> = Omit<O, "id" | "normalizeProps"> & HookOptions & { id: string }

type MaybeGetter<O> = O | (() => O)

function useVirtualizer<O extends object, V extends VirtualizerLike<O>>(
  create: (options: O) => V,
  options: MaybeGetter<Options<O>>,
) {
  const read = () => {
    const { enabled = true, id: _id, ...rest } = typeof options === "function" ? options() : options
    return (enabled ? rest : { ...rest, overscan: Infinity }) as unknown as O
  }

  const { id } = untrack(() => (typeof options === "function" ? options() : options))
  const inner = create({ ...untrack(read), id, normalizeProps })

  let version = $state(0)
  const unsubscribe = inner.subscribe(() => version++)

  // Unchanged options and new callbacks don't re-render
  $effect.pre(() => {
    const next = read()
    untrack(() => inner.updateOptions(next))
  })

  onDestroy(() => {
    unsubscribe()
    inner.destroy()
  })

  // An attachment (`{@attach vz.init}`); only (re)initialises for a new element
  let current: HTMLElement | null = null
  const init = (element: HTMLElement | null | undefined) => {
    if (!element || element === current) return
    current = element
    inner.init(element)
  }

  return {
    /** Read in templates to re-render when the virtualizer updates */
    get virtualizer() {
      void version
      return inner
    },
    init,
  }
}

export const useListVirtualizer = (options: MaybeGetter<Options<ListVirtualizerOptions>>) =>
  useVirtualizer((o) => new ListVirtualizer<PropTypes>(o), options)

export const useGridVirtualizer = (options: MaybeGetter<Options<GridVirtualizerOptions>>) =>
  useVirtualizer((o) => new GridVirtualizer<PropTypes>(o), options)

export const useWindowVirtualizer = (options: MaybeGetter<Options<WindowVirtualizerOptions>>) =>
  useVirtualizer((o) => new WindowVirtualizer<PropTypes>(o), options)

export const useWaterfallVirtualizer = (options: MaybeGetter<Options<WaterfallVirtualizerOptions>>) =>
  useVirtualizer((o) => new WaterfallVirtualizer<PropTypes>(o), options)

export const useTableVirtualizer = (options: MaybeGetter<Options<TableVirtualizerOptions>>) =>
  useVirtualizer((o) => new TableVirtualizer<PropTypes>(o), options)
