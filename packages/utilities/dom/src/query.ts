export function getOwnerDocument(el: HTMLElement) {
  return el?.ownerDocument ?? document
}

export function getOwnerWindow(el: HTMLElement) {
  return el?.ownerDocument.defaultView ?? window
}

export function getEventWindow(event: UIEvent) {
  return (event.view ?? window) as typeof window
}

export function getParent(el: HTMLElement): HTMLElement {
  const doc = getOwnerDocument(el)
  if (el.localName === "html") return el
  return el.assignedSlot || el.parentElement || doc.documentElement
}

type Node = HTMLElement | EventTarget | null

export function contains(parent: Node | undefined, child: Node) {
  if (!parent) return false
  return parent === child || (isHTMLElement(parent) && isHTMLElement(child) && parent.contains(child))
}

export function isHTMLElement(v: any): v is HTMLElement {
  return typeof v === "object" && v?.nodeType === Node.ELEMENT_NODE && typeof v?.nodeName === "string"
}

export const isDisabled = (el: HTMLElement | null): boolean => {
  return el?.getAttribute("disabled") != null || !!el?.getAttribute("aria-disabled") === true
}

export function getNativeEvent<E>(event: E): E extends React.SyntheticEvent<any, infer T> ? T : never {
  return (event as any).nativeEvent ?? event
}
