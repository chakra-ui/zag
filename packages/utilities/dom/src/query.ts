export function getOwnerDocument(el: HTMLElement | Window) {
  if (isWindow(el)) return el.document
  return el?.ownerDocument ?? document
}

export function getOwnerWindow(el: HTMLElement) {
  return el?.ownerDocument.defaultView ?? window
}

export function getDocumentElement(el: HTMLElement | Window): HTMLElement {
  return getOwnerDocument(el).documentElement
}

export function getNodeName(node: HTMLElement | Window): string {
  return isWindow(node) ? "" : node ? node.localName || "" : ""
}

export function getEventWindow(event: UIEvent) {
  if (event.view) return event.view
  let target = event.currentTarget
  if (target != null) return getOwnerWindow(target as HTMLElement)
  return window
}

export function getParent(el: HTMLElement): HTMLElement {
  const doc = getOwnerDocument(el)
  if (getNodeName(el) === "html") return el
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

export function isWindow(value: any): value is Window {
  return value?.toString() === "[object Window]"
}

export const isDisabled = (el: HTMLElement | null): boolean => {
  return el?.getAttribute("disabled") != null || !!el?.getAttribute("aria-disabled") === true
}

export function getNativeEvent<E>(
  event: E,
): React.ChangeEvent<any> extends E ? InputEvent : E extends React.SyntheticEvent<any, infer T> ? T : never {
  return (event as any).nativeEvent ?? event
}
