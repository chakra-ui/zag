import type { Placement, ReferenceElement } from "@floating-ui/dom"
import { getOverflowAncestors } from "@floating-ui/dom"
import { addDomEvent, isHTMLElement, observeElementRect } from "@zag-js/dom-utils"
import { isBoolean, pipe } from "@zag-js/utils"

export type { Placement }

export type AutoUpdateOptions = { ancestorScroll?: boolean; ancestorResize?: boolean; referenceResize?: boolean }
type Ancestors = ReturnType<typeof getOverflowAncestors>

function resolveOptions(option: boolean | AutoUpdateOptions) {
  if (isBoolean(option)) return { ancestorResize: option, ancestorScroll: option, referenceResize: option }
  return Object.assign({ ancestorResize: true, ancestorScroll: true, referenceResize: true }, option)
}

export function autoUpdate(
  reference: ReferenceElement,
  floating: HTMLElement,
  update: () => void,
  options: boolean | AutoUpdateOptions = false,
) {
  const { ancestorScroll, ancestorResize, referenceResize } = resolveOptions(options)

  const useAncestors = ancestorScroll || ancestorResize
  const ancestors: Ancestors = []

  if (useAncestors && isHTMLElement(reference)) {
    ancestors.push(...getOverflowAncestors(reference))
  }

  function addResizeListeners() {
    let cleanups: VoidFunction[] = [observeElementRect(floating, update)]
    if (referenceResize && isHTMLElement(reference)) {
      cleanups.push(observeElementRect(reference, update))
    }
    cleanups.push(pipe(...ancestors.map((el: any) => addDomEvent(el, "resize", update))))
    return () => cleanups.forEach((fn) => fn())
  }

  function addScrollListeners() {
    return pipe(...ancestors.map((el: any) => addDomEvent(el, "scroll", update, { passive: true })))
  }

  return pipe(addResizeListeners(), addScrollListeners())
}
