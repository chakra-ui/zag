import { isHTMLElement, isVisible, isFrame } from "./query"

type IncludeContainerType = boolean | "if-empty"

function hasNegativeTabIndex(element: Element) {
  const tabIndex = parseInt(element.getAttribute("tabindex") || "0", 10)
  return tabIndex < 0
}

export const focusableSelector =
  /*#__PURE__*/ "input:not([type='hidden']):not([disabled]), select:not([disabled]), " +
  "textarea:not([disabled]), a[href], button:not([disabled]), [tabindex], " +
  "iframe, object, embed, area[href], audio[controls], video[controls], " +
  "[contenteditable]:not([contenteditable='false']), details > summary:first-of-type"

/**
 * Returns the focusable elements within the element
 */
export const getFocusables = (
  container: Pick<HTMLElement, "querySelectorAll"> | null,
  includeContainer: IncludeContainerType = false,
) => {
  if (!container) return []
  const elements = Array.from(container.querySelectorAll<HTMLElement>(focusableSelector))

  const include = includeContainer == true || (includeContainer == "if-empty" && elements.length === 0)
  if (include && isHTMLElement(container) && isFocusable(container)) {
    elements.unshift(container)
  }

  const focusableElements = elements.filter(isFocusable)

  focusableElements.forEach((element, i) => {
    if (isFrame(element) && element.contentDocument) {
      const frameBody = element.contentDocument.body
      focusableElements.splice(i, 1, ...getFocusables(frameBody))
    }
  })

  return focusableElements
}

/**
 * Whether this element is focusable
 */
export function isFocusable(element: HTMLElement | null): element is HTMLElement {
  if (!element) return false
  return element.matches(focusableSelector) && isVisible(element)
}

export function getFirstFocusable(container: HTMLElement, includeContainer?: IncludeContainerType) {
  const [first] = getFocusables(container, includeContainer)
  return first || null
}

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

export function getNextTabbable(element: HTMLElement): HTMLElement {
  const tabbableElements = getTabbables(element.ownerDocument.body)
  const indexOfElement = tabbableElements.indexOf(element)
  return tabbableElements[indexOfElement + 1]
}

/**
 * Whether this element is tabbable
 */
export function isTabbable(el: HTMLElement | null): el is HTMLElement {
  return isFocusable(el) && !hasNegativeTabIndex(el)
}

export function getFirstTabbable(container: HTMLElement | null, includeContainer?: IncludeContainerType) {
  const [first] = getTabbables(container, includeContainer)
  return first || null
}

export function getLastTabbable(container: HTMLElement | null, includeContainer?: IncludeContainerType) {
  const elements = getTabbables(container, includeContainer)
  return elements[elements.length - 1] || null
}
