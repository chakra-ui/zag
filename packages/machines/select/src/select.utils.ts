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

export const a11yMessages = {
  onOpen(options: { count: number; prevCount: number }): string {
    const { count, prevCount } = options

    if (!count) {
      return "No results are available."
    }

    if (count !== prevCount) {
      return `${count} result${
        count === 1 ? " is" : "s are"
      } available, use up and down arrow keys to navigate. Press Enter or Space Bar keys to select.`
    }

    return ""
  },
  onHighlight(options: { label: number }): string {
    const { label } = options
    return `${label} selected`
  },
}
