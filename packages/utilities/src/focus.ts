import { domHelper, isSelectableInput } from "./dom-helper"
import { nextTick } from "./function"

type FocusOptions = {
  select: boolean
  preventScroll?: boolean
}

export function focus(el: HTMLElement, options: FocusOptions) {
  const query = domHelper(el)
  const { preventScroll = true, select } = options

  if (query.isDisabled || !el.focus) return
  const prevFocusedEl = query.doc.activeElement
  el.focus({ preventScroll })

  if (el !== prevFocusedEl && isSelectableInput(el) && select) {
    el.select()
  }
}

focus.nextTick = (el: HTMLElement, options: FocusOptions) => {
  return nextTick(() => focus(el, options))
}
