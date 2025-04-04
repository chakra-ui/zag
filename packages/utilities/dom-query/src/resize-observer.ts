import type { MaybeElement } from "@zag-js/types"
import { getWindow, isHTMLElement } from "./node"

export interface ElementRect {
  left: number
  top: number
  width: number
  height: number
}

export interface RectEntryDetails {
  rects: ElementRect[]
  entries: ResizeObserverEntry[]
}

export interface ElementRectOptions extends ResizeObserverOptions {
  /**
   * The callback to call when the element's rect changes.
   */
  onEntry: (details: RectEntryDetails) => void
  /**
   * The function to call to get the element's rect.
   */
  measure: (el: HTMLElement) => ElementRect
}

export function trackElementRect(elements: MaybeElement[], options: ElementRectOptions) {
  const { onEntry, measure, box = "border-box" } = options
  const elems = (Array.isArray(elements) ? elements : [elements]).filter(isHTMLElement)
  const win = getWindow(elems[0])
  const trigger = (entries: ResizeObserverEntry[]) => {
    const rects = elems.map((el) => measure(el))
    onEntry({ rects, entries })
  }
  trigger([])
  const obs = new win.ResizeObserver(trigger)
  elems.forEach((el) => obs.observe(el, { box }))
  return () => obs.disconnect()
}
