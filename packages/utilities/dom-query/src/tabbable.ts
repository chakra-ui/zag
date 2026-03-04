import { getActiveElement, isEditableElement, isElementVisible, isHTMLElement } from "./node"

type IncludeContainerType = boolean | "if-empty"
export type GetShadowRootOption = boolean | ((node: HTMLElement) => ShadowRoot | boolean | undefined) | undefined

export interface TabbableOptions {
  includeContainer?: IncludeContainerType
  getShadowRoot?: GetShadowRootOption
}

export interface NextTabbableOptions {
  current?: HTMLElement | undefined | null
  getShadowRoot?: GetShadowRootOption
}

const isFrame = (el: any): el is HTMLIFrameElement => isHTMLElement(el) && el.tagName === "IFRAME"

const NATURALLY_TABBABLE_REGEX = /^(audio|video|details)$/

function parseTabIndex(el: Element): number {
  const attr = el.getAttribute("tabindex")
  if (!attr) return NaN
  return parseInt(attr, 10)
}

const hasTabIndex = (el: Element) => !Number.isNaN(parseTabIndex(el))
const hasNegativeTabIndex = (el: Element) => parseTabIndex(el) < 0

/**
 * Helper function to get the shadow root from an element based on the getShadowRoot option
 */
function getShadowRootForNode(element: HTMLElement, getShadowRoot?: GetShadowRootOption): ShadowRoot | null {
  if (!getShadowRoot) return null

  if (getShadowRoot === true) {
    return element.shadowRoot || null
  }

  const result = getShadowRoot(element)
  // If function returns true or a ShadowRoot, use it; otherwise try element.shadowRoot
  return (result === true ? element.shadowRoot : result) || null
}

/**
 * Helper function to traverse shadow DOMs and collect elements
 * Optimized with Map-based position tracking for O(1) lookups
 */
function collectElementsWithShadowDOM(
  elements: HTMLElement[],
  getShadowRoot: GetShadowRootOption,
  filterFn: (el: HTMLElement) => boolean,
): HTMLElement[] {
  const allElements = [...elements]
  const toProcess = [...elements]
  const processed = new Set<HTMLElement>()
  const positionMap = new Map<HTMLElement, number>()

  // Initialize position map
  elements.forEach((el, i) => positionMap.set(el, i))

  // Use index instead of shift() to avoid O(n) array reindexing
  let processIndex = 0

  while (processIndex < toProcess.length) {
    const element = toProcess[processIndex++]
    if (!element || processed.has(element)) continue
    processed.add(element)

    const shadowRoot = getShadowRootForNode(element, getShadowRoot)
    if (shadowRoot) {
      const shadowElements = Array.from(shadowRoot.querySelectorAll<HTMLElement>(focusableSelector)).filter(filterFn)

      // Add shadow elements in proper order (after the host element)
      const hostIndex = positionMap.get(element)
      if (hostIndex !== undefined) {
        const insertPosition = hostIndex + 1
        allElements.splice(insertPosition, 0, ...shadowElements)

        // Update position map for newly inserted elements
        shadowElements.forEach((el, i) => {
          positionMap.set(el, insertPosition + i)
        })

        // Update positions for elements that were shifted right
        for (let i = insertPosition + shadowElements.length; i < allElements.length; i++) {
          positionMap.set(allElements[i], i)
        }
      } else {
        const insertPosition = allElements.length
        allElements.push(...shadowElements)
        shadowElements.forEach((el, i) => {
          positionMap.set(el, insertPosition + i)
        })
      }

      // Add shadow elements to process queue for nested shadow roots
      toProcess.push(...shadowElements)
    }
  }

  return allElements
}

const focusableSelector =
  /*#__PURE__*/ "input:not([type='hidden']):not([disabled]), select:not([disabled]), " +
  "textarea:not([disabled]), a[href], button:not([disabled]), [tabindex], " +
  "iframe, object, embed, area[href], audio[controls], video[controls], " +
  "[contenteditable]:not([contenteditable='false']), details > summary:first-of-type"

export const getFocusables = (
  container: Pick<HTMLElement, "querySelectorAll"> | null,
  options: TabbableOptions = {},
) => {
  if (!container) return []
  const { includeContainer = false, getShadowRoot } = options
  const elements = Array.from(container.querySelectorAll<HTMLElement>(focusableSelector))

  const include = includeContainer == true || (includeContainer == "if-empty" && elements.length === 0)
  if (include && isHTMLElement(container) && isFocusable(container)) {
    elements.unshift(container)
  }

  // Build array in one pass, handling iframes without mutation
  const focusableElements: HTMLElement[] = []
  for (const element of elements) {
    if (!isFocusable(element)) continue
    if (isFrame(element) && element.contentDocument) {
      const frameBody = element.contentDocument.body
      focusableElements.push(...getFocusables(frameBody, { getShadowRoot }))
      continue
    }
    focusableElements.push(element)
  }

  // If getShadowRoot is enabled, traverse shadow DOMs
  if (getShadowRoot) {
    return collectElementsWithShadowDOM(focusableElements, getShadowRoot, isFocusable)
  }

  return focusableElements
}

export function isFocusable(element: HTMLElement | EventTarget | null): element is HTMLElement {
  if (!isHTMLElement(element) || element.closest("[inert]")) return false
  return element.matches(focusableSelector) && isElementVisible(element)
}

export function getFirstFocusable(container: HTMLElement | null, options: TabbableOptions = {}): HTMLElement | null {
  const [first] = getFocusables(container, options)
  return first || null
}

export function getTabbables(container: HTMLElement | null, options: TabbableOptions = {}) {
  if (!container) return []
  const { includeContainer, getShadowRoot } = options
  const elements = Array.from(container.querySelectorAll<HTMLElement>(focusableSelector))

  if (includeContainer && isTabbable(container)) {
    elements.unshift(container)
  }

  // Build array in one pass, handling iframes without mutation
  const tabbableElements: HTMLElement[] = []
  for (const element of elements) {
    if (!isTabbable(element)) continue
    if (isFrame(element) && element.contentDocument) {
      const frameBody = element.contentDocument.body
      tabbableElements.push(...getTabbables(frameBody, { getShadowRoot }))
      continue
    }
    tabbableElements.push(element)
  }

  // If getShadowRoot is enabled, traverse shadow DOMs
  if (getShadowRoot) {
    const allElements = collectElementsWithShadowDOM(tabbableElements, getShadowRoot, isTabbable)

    if (!allElements.length && includeContainer) {
      return elements
    }

    return allElements
  }

  if (!tabbableElements.length && includeContainer) {
    return elements
  }

  return tabbableElements
}

export function isTabbable(el: HTMLElement | EventTarget | null): el is HTMLElement {
  if (isHTMLElement(el) && el.tabIndex > 0) return true
  return isFocusable(el) && !hasNegativeTabIndex(el)
}

export function getFirstTabbable(container: HTMLElement | null, options: TabbableOptions = {}): HTMLElement | null {
  const [first] = getTabbables(container, options)
  return first || null
}

export function getLastTabbable(container: HTMLElement | null, options: TabbableOptions = {}): HTMLElement | null {
  const elements = getTabbables(container, options)
  return elements[elements.length - 1] || null
}

export function getTabbableEdges(
  container: HTMLElement | null,
  options: TabbableOptions = {},
): [HTMLElement, HTMLElement] | [null, null] {
  const elements = getTabbables(container, options)
  const first = elements[0] || null
  const last = elements[elements.length - 1] || null
  return [first, last]
}

export function getNextTabbable(container: HTMLElement | null, options: NextTabbableOptions = {}): HTMLElement | null {
  const { current, getShadowRoot } = options
  const tabbables = getTabbables(container, { getShadowRoot })
  const doc = container?.ownerDocument || document
  const currentElement = current ?? getActiveElement(doc)
  if (!currentElement) return null
  const index = tabbables.indexOf(currentElement)
  return tabbables[index + 1] || null
}

export function getTabIndex(node: HTMLElement | SVGElement) {
  if (node.tabIndex < 0) {
    if ((NATURALLY_TABBABLE_REGEX.test(node.localName) || isEditableElement(node)) && !hasTabIndex(node)) {
      return 0
    }
  }
  return node.tabIndex
}
