export function isDocument(el: any): el is Document {
  return el.nodeType === Node.DOCUMENT_NODE
}

export function isShadowRoot(el: any): el is ShadowRoot {
  return el?.toString() === "[object ShadowRoot]"
}

export function isWindow(value: any): value is Window {
  return value?.toString() === "[object Window]"
}

export function isFrame(element: Element): element is HTMLIFrameElement {
  return element.localName === "iframe"
}

export const isWithinShadowRoot = (node: HTMLElement) => {
  return isShadowRoot(node.getRootNode())
}

export function getDocument(el: Element | Window | Node | Document | null) {
  if (isWindow(el)) return el.document
  if (isDocument(el)) return el
  return el?.ownerDocument ?? document
}

export function getRootNode(el: Node) {
  return el.getRootNode() as Document | ShadowRoot
}

export function getWindow(el: HTMLElement) {
  return el?.ownerDocument.defaultView ?? window
}

export function getDocumentElement(el: HTMLElement | Window): HTMLElement {
  return getDocument(el).documentElement
}

export function getNodeName(node: HTMLElement | Window | null): string {
  return isWindow(node) ? "" : node?.localName ?? ""
}

export function getEventWindow(event: UIEvent) {
  if (event.view) return event.view
  let target = event.currentTarget
  if (target != null) return getWindow(target as HTMLElement)
  return window
}

export function getEventTarget<T extends EventTarget>(event: Event): T | null {
  return (event.composedPath?.()[0] ?? event.target) as T | null
}

export function getActiveElement(el: HTMLElement): HTMLElement | null {
  let activeElement = getDocument(el).activeElement as HTMLElement | null

  while (activeElement && activeElement.shadowRoot) {
    const el = activeElement.shadowRoot.activeElement as HTMLElement | null
    if (el === activeElement) break
    else activeElement = el
  }

  return activeElement
}

export function getActiveDescendant(node: HTMLElement | null): HTMLElement | null {
  if (!node) return null
  const id = node.getAttribute("aria-activedescendant")
  if (!id) return null
  return getDocument(node).getElementById(id)
}

export function getParent(el: HTMLElement): HTMLElement {
  const doc = getDocument(el)
  if (getNodeName(el) === "html") return el
  return el.assignedSlot || el.parentElement || doc.documentElement
}

type Ctx = {
  getRootNode?: () => Document | ShadowRoot | Node
}

export interface CustomEventListener<EventMap extends Record<string, any>> {
  <E extends keyof EventMap>(event: E, cb: (evt: CustomEvent<EventMap[E]>) => void): VoidFunction
}

export interface CustomEventEmitter<EventMap extends Record<string, any>> {
  <E extends keyof EventMap>(evt: E, detail: EventMap[E], options?: EventInit): void
}

export function defineDomHelpers<T>(helpers: T) {
  const dom = {
    getRootNode: (ctx: Ctx) => (ctx.getRootNode?.() ?? document) as Document | ShadowRoot,
    getDoc: (ctx: Ctx) => getDocument(dom.getRootNode(ctx)),
    getWin: (ctx: Ctx) => dom.getDoc(ctx).defaultView ?? window,
    getActiveElement: (ctx: Ctx) => dom.getDoc(ctx).activeElement as HTMLElement | null,
    getById: <T = HTMLElement>(ctx: Ctx, id: string) => dom.getRootNode(ctx).getElementById(id) as T | null,
    createEmitter: <EventMap extends Record<string, any>>(
      ctx: Ctx,
      target: HTMLElement,
    ): CustomEventEmitter<EventMap> => {
      const win = dom.getWin(ctx)
      return function emit(evt, detail, options) {
        const { bubbles = true, cancelable, composed = true } = options ?? {}
        const eventName = `zag:${String(evt)}`
        const init: CustomEventInit = { bubbles, cancelable, composed, detail }
        const event = new win.CustomEvent(eventName, init)
        target.dispatchEvent(event)
      }
    },
    createListener: <EventMap extends Record<string, any>>(target: HTMLElement): CustomEventListener<EventMap> => {
      return function listen(evt, handler) {
        const eventName = `zag:${String(evt)}`
        const listener: any = (e: CustomEvent) => handler(e)
        target.addEventListener(eventName, listener)
        return () => target.removeEventListener(eventName, listener)
      }
    },
  }

  return {
    ...dom,
    ...helpers,
  }
}

export function contains(
  parent: HTMLElement | EventTarget | null | undefined,
  child: HTMLElement | EventTarget | null,
) {
  if (!parent) return false
  return parent === child || (isHTMLElement(parent) && isHTMLElement(child) && parent.contains(child))
}

export function isHTMLElement(v: any): v is HTMLElement {
  return typeof v === "object" && v?.nodeType === Node.ELEMENT_NODE && typeof v?.nodeName === "string"
}

export const isDisabled = (el: HTMLElement | null): boolean => {
  return el?.getAttribute("disabled") != null || !!el?.getAttribute("aria-disabled") === true
}

export function isElementEditable(el: HTMLElement | null) {
  if (el == null) return false
  try {
    const win = getWindow(el)
    return (
      (el instanceof win.HTMLInputElement && el.selectionStart != null) ||
      /(textarea|select)/.test(el.localName) ||
      el.isContentEditable
    )
  } catch {
    return false
  }
}

export function isVisible(el: Element) {
  if (!isHTMLElement(el)) return false
  return el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0
}
