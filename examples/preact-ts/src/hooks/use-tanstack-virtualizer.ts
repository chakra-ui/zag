import {
  elementScroll,
  observeElementOffset,
  observeElementRect,
  observeWindowOffset,
  observeWindowRect,
  Virtualizer,
  windowScroll,
  type PartialKeys,
  type VirtualizerOptions,
} from "@tanstack/virtual-core"
import { useLayoutEffect, useReducer, useState } from "preact/hooks"

// TanStack Virtual has no Preact adapter; mirrors its React one

function useVirtualizerBase<TScrollElement extends Element | Window, TItemElement extends Element>(
  options: VirtualizerOptions<TScrollElement, TItemElement>,
): Virtualizer<TScrollElement, TItemElement> {
  const rerender = useReducer(() => ({}), {})[1]

  const resolvedOptions: VirtualizerOptions<TScrollElement, TItemElement> = {
    ...options,
    onChange: (instance, sync) => {
      rerender(undefined)
      options.onChange?.(instance, sync)
    },
  }

  const [instance] = useState(() => new Virtualizer<TScrollElement, TItemElement>(resolvedOptions))
  instance.setOptions(resolvedOptions)

  useLayoutEffect(() => instance._didMount(), [])
  useLayoutEffect(() => instance._willUpdate())

  return instance
}

export function useVirtualizer<TScrollElement extends Element, TItemElement extends Element>(
  options: PartialKeys<
    VirtualizerOptions<TScrollElement, TItemElement>,
    "observeElementRect" | "observeElementOffset" | "scrollToFn"
  >,
): Virtualizer<TScrollElement, TItemElement> {
  return useVirtualizerBase<TScrollElement, TItemElement>({
    observeElementRect,
    observeElementOffset,
    scrollToFn: elementScroll,
    ...options,
  })
}

export function useWindowVirtualizer<TItemElement extends Element>(
  options: PartialKeys<
    VirtualizerOptions<Window, TItemElement>,
    "getScrollElement" | "observeElementRect" | "observeElementOffset" | "scrollToFn"
  >,
): Virtualizer<Window, TItemElement> {
  return useVirtualizerBase<Window, TItemElement>({
    getScrollElement: () => (typeof document !== "undefined" ? window : null),
    observeElementRect: observeWindowRect,
    observeElementOffset: observeWindowOffset,
    scrollToFn: windowScroll,
    initialOffset: () => (typeof document !== "undefined" ? window.scrollY : 0),
    ...options,
  })
}
