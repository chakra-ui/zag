import { getWindow } from "./env"

const styleCache = new WeakMap<Element, CSSStyleDeclaration>()

export function getComputedStyle(el: Element) {
  if (!styleCache.has(el)) {
    styleCache.set(el, getWindow(el).getComputedStyle(el))
  }
  return styleCache.get(el)!
}
