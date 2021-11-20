export const t = (v: any) => Object.prototype.toString.call(v).slice(8, -1)

export const isRef = (v: any): v is RefTarget => {
  return t(v) === "Object" && "current" in v
}

export const runIfFn = (fn: any): HTMLElement | null => {
  return t(fn) === "Function" ? fn() : fn
}

const isTouchEvent = (v: Event): v is TouchEvent => {
  return t(v) === "Object" && !!(v as TouchEvent).touches
}

const fallback = { pageX: 0, pageY: 0, clientX: 0, clientY: 0 }

export function extractInfo<T extends AnyPointerEvent = AnyPointerEvent>(event: T, type: "page" | "client" = "page") {
  const point = isTouchEvent(event) ? event.touches[0] || event.changedTouches[0] || fallback : event
  return {
    point: {
      x: point[`${type}X`],
      y: point[`${type}Y`],
    },
  }
}

export function addDomEvent<K extends keyof EventMap>(
  target: DOMEventTarget,
  event: K,
  listener: (event: EventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
) {
  const node = isRef(target) ? target.current : runIfFn(target)
  node?.addEventListener(event, listener as any, options)
  return () => node?.removeEventListener(event, listener as any, options)
}

export function addPointerEvent<K extends keyof EventMap>(
  target: DOMEventTarget,
  event: K,
  listener: (event: EventMap[K], info: PointerEventInfo) => void,
  options?: boolean | AddEventListenerOptions,
) {
  return addDomEvent(target, getEventName(event), wrapHandler(listener, event === "pointerdown"), options)
}

function wrapHandler<E extends EventMap[keyof EventMap]>(
  fn: (event: E, info: PointerEventInfo) => void,
  filter = false,
) {
  const listener: EventListener = (event: any) => {
    fn(event, extractInfo(event))
  }
  return filter ? filterPrimaryPointer(listener) : listener
}

function filterPrimaryPointer(fn: EventListener): EventListener {
  return (event: Event) => {
    const win = ((event as UIEvent).view ?? window) as typeof window
    const isMouseEvent = event instanceof win.MouseEvent
    const isPrimary = !isMouseEvent || (isMouseEvent && (event as MouseEvent).button === 0)
    if (isPrimary) {
      fn(event)
    }
  }
}

export function extractClientInfo(event: AnyPointerEvent) {
  return extractInfo(event, "client")
}

const supportsPointerEvent = () => typeof window !== "undefined" && window.onpointerdown === null
const supportsTouchEvent = () => typeof window !== "undefined" && window.ontouchstart === null
const supportsMouseEvent = () => typeof window !== "undefined" && window.onmousedown === null

export function getEventName(evt: keyof EventMap): keyof EventMap {
  if (supportsPointerEvent()) return evt
  if (supportsTouchEvent()) return touchEventNames[evt]
  if (supportsMouseEvent()) return mouseEventNames[evt]
  return evt
}

export interface EventMap extends DocumentEventMap, WindowEventMap, HTMLElementEventMap {}

export type DOMTarget = Document | HTMLElement | EventTarget | null
export type AnyPointerEvent = MouseEvent | TouchEvent | PointerEvent
export type RefTarget = { current: HTMLElement | null }
export type DOMEventTarget = (() => DOMTarget) | DOMTarget | RefTarget
export type EventListenerOptions = boolean | AddEventListenerOptions
export interface PointerEventInfo {
  point: { x: number; y: number }
}
export type EventListenerWithPointInfo<T extends AnyPointerEvent = AnyPointerEvent> = (
  event: T,
  info: PointerEventInfo,
) => void

interface PointerNameMap {
  pointerdown: string
  pointermove: string
  pointerup: string
  pointercancel: string
  pointerover?: string
  pointerout?: string
  pointerenter?: string
  pointerleave?: string
}

const mouseEventNames: PointerNameMap = {
  pointerdown: "mousedown",
  pointermove: "mousemove",
  pointerup: "mouseup",
  pointercancel: "mousecancel",
  pointerover: "mouseover",
  pointerout: "mouseout",
  pointerenter: "mouseenter",
  pointerleave: "mouseleave",
}

const touchEventNames: PointerNameMap = {
  pointerdown: "touchstart",
  pointermove: "touchmove",
  pointerup: "touchend",
  pointercancel: "touchcancel",
}
