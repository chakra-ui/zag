import type { Placement, ReferenceElement } from "@floating-ui/dom"
import { getOverflowAncestors } from "@floating-ui/dom"
import { trackElementRect } from "@zag-js/element-rect"

export type { Placement }

export type AutoUpdateOptions = {
  ancestorScroll?: boolean
  ancestorResize?: boolean
  referenceResize?: boolean
}

type Ancestors = ReturnType<typeof getOverflowAncestors>

const callAll =
  (...fns: VoidFunction[]) =>
  () =>
    fns.forEach((fn) => fn())

const isHTMLElement = (el: any): el is HTMLElement => {
  return typeof el === "object" && el !== null && el.nodeType === 1
}

const addDomEvent = (el: HTMLElement, type: string, fn: VoidFunction, options?: boolean | AddEventListenerOptions) => {
  el.addEventListener(type, fn, options)
  return () => el.removeEventListener(type, fn, options)
}

function resolveOptions(option: boolean | AutoUpdateOptions) {
  const bool = typeof option === "boolean"
  return {
    ancestorResize: bool ? option : option.ancestorResize ?? true,
    ancestorScroll: bool ? option : option.ancestorScroll ?? true,
    referenceResize: bool ? option : option.referenceResize ?? true,
  }
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
    let cleanups: VoidFunction[] = [trackElementRect(floating, { scope: "size", onChange: update })]
    if (referenceResize && isHTMLElement(reference)) {
      cleanups.push(trackElementRect(reference, { onChange: update }))
    }
    cleanups.push(callAll(...ancestors.map((el: any) => addDomEvent(el, "resize", update))))
    return () => cleanups.forEach((fn) => fn())
  }

  function addScrollListeners() {
    return callAll(...ancestors.map((el: any) => addDomEvent(el, "scroll", update, { passive: true })))
  }

  return callAll(addResizeListeners(), addScrollListeners())
}
