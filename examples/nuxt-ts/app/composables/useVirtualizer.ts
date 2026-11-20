import { normalizeProps, type PropTypes } from "@zag-js/vue"
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
import {
  onScopeDispose,
  shallowRef,
  toValue,
  triggerRef,
  useId,
  watchEffect,
  type MaybeRefOrGetter,
  type ShallowRef,
} from "vue"

interface VirtualizerLike<O> {
  subscribe: (listener: () => void) => () => void
  init: (element: HTMLElement) => void
  destroy: () => void
  updateOptions: (options: Partial<O>) => void
}

interface HookOptions {
  /** Set `false` to render every item */
  enabled?: boolean
}

type Options<O> = MaybeRefOrGetter<Omit<O, "id" | "normalizeProps"> & HookOptions>

const withEnabled = <O extends object>({ enabled = true, ...options }: O & HookOptions): O =>
  (enabled ? options : { ...options, overscan: Infinity }) as O

function useVirtualizer<O extends object, V extends VirtualizerLike<O>>(
  create: (options: O) => V,
  options: Options<O>,
) {
  const read = () => withEnabled(toValue(options) as O & HookOptions)
  const instance = create({ ...read(), id: useId(), normalizeProps })

  // Same instance, re-triggered on every change so templates re-render
  const virtualizer = shallowRef(instance) as ShallowRef<V>
  const unsubscribe = instance.subscribe(() => triggerRef(virtualizer))

  // Unchanged options and new callbacks don't re-render
  watchEffect(() => instance.updateOptions(read()), { flush: "pre" })

  // Function refs run on every render; only (re)initialise for a new element
  let current: Element | null = null
  const ref = (element: Element | null | object) => {
    if (!(element instanceof HTMLElement) || element === current) return
    current = element
    instance.init(element)
  }

  onScopeDispose(() => {
    unsubscribe()
    instance.destroy()
  })

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
