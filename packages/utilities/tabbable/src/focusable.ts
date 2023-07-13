import { focusableSelector, isFrame, isHTMLElement, isVisible, type IncludeContainerType } from "./shared"

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
  if (!element || element.closest("[inert]")) return false
  return element.matches(focusableSelector) && isVisible(element)
}

export function getFirstFocusable(container: HTMLElement, includeContainer?: IncludeContainerType) {
  const [first] = getFocusables(container, includeContainer)
  return first || null
}
