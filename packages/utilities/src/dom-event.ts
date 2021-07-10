import { MaybeArray, toArray } from "./array"
import { isMouseEvent, isRefObject, isRightClickEvent } from "./assertion"
import { contains, domHelper, isHTMLElement } from "./dom-helper"
import {
  supportsMouseEvents,
  supportsPointerEvents,
  supportsTouchEvents,
} from "./environment"
import { cast, runIfFn } from "./function"
import { AnyPointerEvent, Point, PointType } from "./point"

/* -----------------------------------------------------------------------------
 * Pointer Events
 * -----------------------------------------------------------------------------*/

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

export function addDomEvent<K extends keyof WindowEventMap>(
  target: DOMEventTarget,
  type: K,
  listener: (ev: WindowEventMap[K]) => any,
  options?: EventListenerOptions,
): VoidFunction
export function addDomEvent<K extends keyof HTMLElementEventMap>(
  target: DOMEventTarget,
  event: K,
  listener: (ev: HTMLElementEventMap[K]) => any,
  options?: EventListenerOptions,
): VoidFunction
export function addDomEvent<K extends keyof DocumentEventMap>(
  target: DOMEventTarget,
  event: K,
  listener: EventListener,
  options?: EventListenerOptions,
) {
  const node = isRefObject(target) ? target.current : runIfFn(target)
  const eventName = getEventName(event)
  const callback = withPrimaryPointer(listener, event === "pointerdown")
  node?.addEventListener(eventName, callback, options)
  return () => {
    node?.removeEventListener(eventName, callback, options)
  }
}

function getEventName(eventName: string): string {
  if (supportsPointerEvents()) return eventName
  if (supportsTouchEvents()) return touchEventNames[eventName]
  if (supportsMouseEvents()) return mouseEventNames[eventName]
  return eventName
}

function withPrimaryPointer(
  handler: EventListenerWithPointInfo,
  shouldFilterPrimaryPointer = false,
) {
  const handlerWithFilter: EventListener = (event: any) => {
    const isPrimaryPointer = !isMouseEvent(event) || !isRightClickEvent(event)
    if (isPrimaryPointer) {
      handler(event, extractInfo(event))
    }
  }

  const handlerWithoutFilter: EventListener = (event: any) => {
    handler(event, extractInfo(event))
  }

  return shouldFilterPrimaryPointer ? handlerWithFilter : handlerWithoutFilter
}

function extractInfo(event: AnyPointerEvent, type: PointType = "page") {
  return { point: Point.fromPointerEvent(event, type) }
}

export function extractClientInfo(event: AnyPointerEvent) {
  return extractInfo(event, "client")
}

/* -----------------------------------------------------------------------------
 * Portal Events
 * -----------------------------------------------------------------------------*/

/**
 * Check if the event originated within a portalled element
 */
export function isPortalEvent(
  event: Pick<Event, "currentTarget" | "target">,
): boolean {
  if (!isHTMLElement(event.currentTarget) || !isHTMLElement(event.target)) {
    return false
  }
  return !domHelper(event.currentTarget).contains(event.target)
}

/* -----------------------------------------------------------------------------
 * Focus and Blur Events
 * -----------------------------------------------------------------------------*/

type ValidBlurEventOptions = {
  exclude: MaybeArray<HTMLElement | null>
  pointerdownNode?: HTMLElement | null
}

/**
 * Determine if the blur event within an element is valid
 */
export function isValidBlurEvent(
  event: Pick<FocusEvent, "relatedTarget">,
  options: ValidBlurEventOptions,
) {
  const exclude = toArray(options.exclude)
  const relatedTarget = cast<HTMLElement>(
    event.relatedTarget ?? options.pointerdownNode,
  )
  return exclude.every((el) => !contains(el, relatedTarget))
}

/**
 * Returns the pointerdown target for a blur event
 * It is used as a polyfill for the `relatedTarget` property
 */
export function trackPointerDown(
  doc: Document | undefined,
  fn: (el: HTMLElement) => void,
) {
  const ownerDoc = doc ?? document
  const listener = (event: any) => {
    if (event.target instanceof HTMLElement) {
      fn(event.target)
    }
  }
  return addDomEvent(ownerDoc, "pointerdown", listener)
}

/* -----------------------------------------------------------------------------
 * Event Dispatch Utils
 * -----------------------------------------------------------------------------*/

/**
 * Dispatch change event for hidden input elements
 */
export function dispatchInputEvent(input: HTMLElement, value: string | number) {
  if (!(input instanceof HTMLInputElement)) return

  input.type = "text"
  input.hidden = true

  const set = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set

  set?.call(input, value)

  const evt = new Event("input", { bubbles: true })
  input.dispatchEvent(evt)

  input.type = "hidden"
  input.hidden = false
}
