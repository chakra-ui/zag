export const isHTMLElement = (element: any): element is HTMLElement =>
  typeof element === "object" && element !== null && element.nodeType === 1

export const isFrame = (element: any): element is HTMLIFrameElement =>
  isHTMLElement(element) && element.tagName === "IFRAME"

export function isVisible(el: any) {
  if (!isHTMLElement(el)) return false
  return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0
}

export type IncludeContainerType = boolean | "if-empty"

export function hasNegativeTabIndex(element: Element) {
  const tabIndex = parseInt(element.getAttribute("tabindex") || "0", 10)
  return tabIndex < 0
}

export const focusableSelector =
  /*#__PURE__*/ "input:not([type='hidden']):not([disabled]), select:not([disabled]), " +
  "textarea:not([disabled]), a[href], button:not([disabled]), [tabindex], " +
  "iframe, object, embed, area[href], audio[controls], video[controls], " +
  "[contenteditable]:not([contenteditable='false']), details > summary:first-of-type"
