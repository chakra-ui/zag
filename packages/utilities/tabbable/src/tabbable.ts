import { isFocusable } from "./focusable"
import { focusableSelector, hasNegativeTabIndex, isFrame, type IncludeContainerType } from "./shared"

/**
 * Returns the tabbable elements within the element
 */
export function getTabbables(container: HTMLElement | null, includeContainer?: IncludeContainerType) {
  if (!container) return []
  const elements = Array.from(container.querySelectorAll<HTMLElement>(focusableSelector))
  const tabbableElements = elements.filter(isTabbable)

  if (includeContainer && isTabbable(container)) {
    tabbableElements.unshift(container)
  }

  tabbableElements.forEach((element, i) => {
    if (isFrame(element) && element.contentDocument) {
      const frameBody = element.contentDocument.body
      const allFrameTabbable = getTabbables(frameBody)
      tabbableElements.splice(i, 1, ...allFrameTabbable)
    }
  })

  if (!tabbableElements.length && includeContainer) {
    return elements
  }

  return tabbableElements
}

/**
 * Whether this element is tabbable
 */
export function isTabbable(el: HTMLElement | null): el is HTMLElement {
  if (el != null && el.tabIndex > 0) return true
  return isFocusable(el) && !hasNegativeTabIndex(el)
}

/**
 * Returns the first focusable element within the element
 */
export function getFirstTabbable(container: HTMLElement | null, includeContainer?: IncludeContainerType) {
  const [first] = getTabbables(container, includeContainer)
  return first || null
}

/**
 * Returns the last focusable element within the element
 */
export function getLastTabbable(container: HTMLElement | null, includeContainer?: IncludeContainerType) {
  const elements = getTabbables(container, includeContainer)
  return elements[elements.length - 1] || null
}

/**
 * Returns the first and last focusable elements within the element
 */
export function getTabbableEdges(container: HTMLElement | null, includeContainer?: IncludeContainerType) {
  const elements = getTabbables(container, includeContainer)
  const first = elements[0] || null
  const last = elements[elements.length - 1] || null
  return [first, last]
}

/**
 * Returns the next tabbable element after the current element
 */
export function getNextTabbable(container: HTMLElement | null, current?: HTMLElement | null) {
  const tabbables = getTabbables(container)
  const doc = container?.ownerDocument || document
  const currentElement = current ?? (doc.activeElement as HTMLElement | null)
  if (!currentElement) return null
  const index = tabbables.indexOf(currentElement)
  return tabbables[index + 1] || null
}
