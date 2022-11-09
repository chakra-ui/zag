import {
  elementScroll,
  observeElementOffset,
  observeElementRect,
  Virtualizer,
  VirtualizerOptions,
} from "@tanstack/virtual-core"

export function setupVirtualize<TScrollElement, TItemElement extends Element>(
  options: VirtualizerOptions<TScrollElement, TItemElement>,
) {
  return new Virtualizer({
    ...options,
    observeElementRect: observeElementRect,
    observeElementOffset: observeElementOffset,
    scrollToFn: elementScroll,
  })
}
