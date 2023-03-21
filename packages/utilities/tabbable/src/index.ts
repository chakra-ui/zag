const isHTMLElement = (element: any): element is HTMLElement =>
  typeof element === "object" && element !== null && element.nodeType === 1

const isFrame = (element: any): element is HTMLIFrameElement => isHTMLElement(element) && element.tagName === "IFRAME"

function isVisible(el: any) {
  if (!isHTMLElement(el)) return false
  return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0
}

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

/**
 * Whether this element is tabbable
 */
export function isTabbable(el: HTMLElement | null): el is HTMLElement {
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

/**
 * Proxies tab focus within a container to a reference element
 * when the container is rendered in a portal
 */
export function proxyTabFocus(
  container: HTMLElement | null,
  reference: HTMLElement | null,
  cb: (elementToFocus: HTMLElement) => void,
) {
  const doc = container?.ownerDocument || document
  const body = doc.body

  function onKeyDown(event: KeyboardEvent) {
    if (event.key !== "Tab") return

    let elementToFocus: HTMLElement | null = null

    // get all tabbable elements within the container
    const [firstTabbable, lastTabbable] = getTabbableEdges(container)

    // if we're focused on the first tabbable element and the user tabs backwards
    // we want to focus the reference element
    if (event.shiftKey && doc.activeElement === firstTabbable) {
      elementToFocus = reference
    } else if (!event.shiftKey && doc.activeElement === reference) {
      // if we're focused on the reference element and the user tabs forwards
      // we want to focus the first tabbable element
      elementToFocus = firstTabbable
    } else if (!event.shiftKey && doc.activeElement === lastTabbable) {
      // if we're focused on the last tabbable element and the user tabs forwards
      // we want to focus the next tabbable element after the reference element
      elementToFocus = getNextTabbable(body, reference)
    }

    if (!elementToFocus) return

    event.preventDefault()
    cb(elementToFocus)
  }

  // listen for the tab key in the capture phase
  doc?.addEventListener("keydown", onKeyDown, true)

  return () => {
    doc?.removeEventListener("keydown", onKeyDown, true)
  }
}
