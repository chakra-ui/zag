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

export interface PointerNameMap {
  pointerdown: string
  pointermove: string
  pointerup: string
  pointercancel: string
  pointerover?: string
  pointerout?: string
  pointerenter?: string
  pointerleave?: string
}
