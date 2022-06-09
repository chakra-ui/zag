import { contains, getOwnerDocument } from "@zag-js/dom-utils"

type Elements = Array<Element | null>

export function isValidElement(element: Element, ignore: Elements) {
  if (/(script|style)/.test(element.localName)) return false
  return !ignore.some((el) => el && contains(element, el))
}

export function walkTreeOutside(elements: Elements, callback: (element: Element) => void) {
  for (let element of elements) {
    const doc = getOwnerDocument(element)
    while (element?.parentElement && element !== doc.body) {
      for (const child of element.parentElement.children) {
        if (isValidElement(child, elements)) callback(child)
      }
      element = element.parentElement
    }
  }
}
