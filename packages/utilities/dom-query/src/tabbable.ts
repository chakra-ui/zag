import { isEditableElement, isElementVisible, isHTMLElement } from "./node"

type IncludeContainerType = boolean | "if-empty"

const isFrame = (el: any): el is HTMLIFrameElement => isHTMLElement(el) && el.tagName === "IFRAME"

const hasTabIndex = (el: Element) => !Number.isNaN(parseInt(el.getAttribute("tabindex") || "0", 10))
const hasNegativeTabIndex = (el: Element) => parseInt(el.getAttribute("tabindex") || "0", 10) < 0

const focusableSelector =
  /*#__PURE__*/ "input:not([type='hidden']):not([disabled]), select:not([disabled]), " +
  "textarea:not([disabled]), a[href], button:not([disabled]), [tabindex], " +
  "iframe, object, embed, area[href], audio[controls], video[controls], " +
  "[contenteditable]:not([contenteditable='false']), details > summary:first-of-type"

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

export function isFocusable(element: HTMLElement | null): element is HTMLElement {
  if (!element || element.closest("[inert]")) return false
  return element.matches(focusableSelector) && isElementVisible(element)
}

export function getFirstFocusable(
  container: HTMLElement | null,
  includeContainer?: IncludeContainerType,
): HTMLElement | null {
  const [first] = getFocusables(container, includeContainer)
  return first || null
}

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

export function isTabbable(el: HTMLElement | null): el is HTMLElement {
  if (el != null && el.tabIndex > 0) return true
  return isFocusable(el) && !hasNegativeTabIndex(el)
}

export function getFirstTabbable(
  container: HTMLElement | null,
  includeContainer?: IncludeContainerType,
): HTMLElement | null {
  const [first] = getTabbables(container, includeContainer)
  return first || null
}

export function getLastTabbable(
  container: HTMLElement | null,
  includeContainer?: IncludeContainerType,
): HTMLElement | null {
  const elements = getTabbables(container, includeContainer)
  return elements[elements.length - 1] || null
}

export function getTabbableEdges(
  container: HTMLElement | null,
  includeContainer?: IncludeContainerType,
): [HTMLElement, HTMLElement] | [null, null] {
  const elements = getTabbables(container, includeContainer)
  const first = elements[0] || null
  const last = elements[elements.length - 1] || null
  return [first, last]
}

export function getNextTabbable(container: HTMLElement | null, current?: HTMLElement | null): HTMLElement | null {
  const tabbables = getTabbables(container)
  const doc = container?.ownerDocument || document
  const currentElement = current ?? (doc.activeElement as HTMLElement | null)
  if (!currentElement) return null
  const index = tabbables.indexOf(currentElement)
  return tabbables[index + 1] || null
}

export function getTabIndex(node: HTMLElement | SVGElement) {
  if (node.tabIndex < 0) {
    if ((/^(audio|video|details)$/.test(node.localName) || isEditableElement(node)) && !hasTabIndex(node)) {
      return 0
    }
  }
  return node.tabIndex
}
