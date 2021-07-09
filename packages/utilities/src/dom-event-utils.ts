import { isMouseEvent, isRefObject, isRightClickEvent } from "./assertion-utils"
import {
  supportsMouseEvents,
  supportsPointerEvents,
  supportsTouchEvents,
} from "./environment-utils"
import { runIfFn } from "./function-utils"
import { AnyPointerEvent, Point, PointType } from "./point-utils"

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

type Target = Document | HTMLElement | EventTarget | null

type RefTarget = { current: HTMLElement | null }

export type DOMEventTarget = (() => Target) | Target | RefTarget

type EventListenerOptions = boolean | AddEventListenerOptions

export interface PointerEventInfo {
  point: Point
}

export type EventListenerWithPointInfo = (
  event: AnyPointerEvent,
  info: PointerEventInfo,
) => void

export class DOMEvent {
  static on<K extends keyof WindowEventMap>(
    target: DOMEventTarget,
    type: K,
    listener: (ev: WindowEventMap[K]) => any,
    options?: EventListenerOptions,
  ): VoidFunction

  static on<K extends keyof HTMLElementEventMap>(
    target: DOMEventTarget,
    event: K,
    listener: (ev: HTMLElementEventMap[K]) => any,
    options?: EventListenerOptions,
  ): VoidFunction

  static on<K extends keyof DocumentEventMap>(
    target: DOMEventTarget,
    event: K,
    listener: EventListener,
    options?: EventListenerOptions,
  ) {
    const node = isRefObject(target) ? target.current : runIfFn(target)
    const eventName = DOMEvent.getEventName(event)
    const callback = DOMEvent.withPrimaryPointer(
      listener,
      event === "pointerdown",
    )
    node?.addEventListener(eventName, callback, options)
    return () => {
      node?.removeEventListener(eventName, callback, options)
    }
  }

  static getEventName(eventName: string): string {
    if (supportsPointerEvents()) return eventName
    if (supportsTouchEvents()) return touchEventNames[eventName]
    if (supportsMouseEvents()) return mouseEventNames[eventName]
    return eventName
  }

  static withPrimaryPointer = (
    handler: EventListenerWithPointInfo,
    shouldFilterPrimaryPointer = false,
  ) => {
    const handlerWithFilter: EventListener = (event: any) => {
      const isPrimaryPointer = !isMouseEvent(event) || !isRightClickEvent(event)
      if (isPrimaryPointer) {
        handler(event, { point: DOMEvent.extractInfo(event) })
      }
    }

    const handlerWithoutFilter: EventListener = (event: any) => {
      handler(event, { point: DOMEvent.extractInfo(event) })
    }

    return shouldFilterPrimaryPointer ? handlerWithFilter : handlerWithoutFilter
  }

  static extractInfo(event: AnyPointerEvent, type: PointType = "page") {
    return Point.fromPointerEvent(event, type)
  }

  static extractClientInfo(event: AnyPointerEvent) {
    return DOMEvent.extractInfo(event, "client")
  }
}
