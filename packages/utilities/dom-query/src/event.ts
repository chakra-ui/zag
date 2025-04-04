import type { MaybeFn } from "@zag-js/types"
import { contains } from "./node"
import { isAndroid, isApple, isMac } from "./platform"
import type { AnyPointerEvent, EventKeyOptions, NativeEvent } from "./types"

export function getBeforeInputValue(event: Pick<InputEvent, "currentTarget">) {
  const { selectionStart, selectionEnd, value } = event.currentTarget as HTMLInputElement
  return value.slice(0, selectionStart!) + (event as any).data + value.slice(selectionEnd!)
}

function getComposedPath(event: any): EventTarget[] | undefined {
  return event.composedPath?.() ?? event.nativeEvent?.composedPath?.()
}

export function getEventTarget<T extends EventTarget>(
  event: Partial<Pick<UIEvent, "target" | "composedPath">>,
): T | null {
  const composedPath = getComposedPath(event)
  return (composedPath?.[0] ?? event.target) as T | null
}

export const isSelfTarget = (event: Partial<Pick<UIEvent, "currentTarget" | "target" | "composedPath">>) => {
  return contains(event.currentTarget as Node, getEventTarget(event))
}

export function isOpeningInNewTab(event: Pick<MouseEvent, "currentTarget" | "metaKey" | "ctrlKey">) {
  const element = event.currentTarget as HTMLAnchorElement | HTMLButtonElement | HTMLInputElement | null
  if (!element) return false

  const isAppleDevice = isApple()
  if (isAppleDevice && !event.metaKey) return false
  if (!isAppleDevice && !event.ctrlKey) return false

  const localName = element.localName

  if (localName === "a") return true
  if (localName === "button" && element.type === "submit") return true
  if (localName === "input" && element.type === "submit") return true

  return false
}

export function isDownloadingEvent(event: Pick<MouseEvent, "altKey" | "currentTarget">) {
  const element = event.currentTarget as HTMLAnchorElement | HTMLButtonElement | HTMLInputElement | null
  if (!element) return false
  const localName = element.localName
  if (!event.altKey) return false
  if (localName === "a") return true
  if (localName === "button" && element.type === "submit") return true
  if (localName === "input" && element.type === "submit") return true
  return false
}

export function isComposingEvent(event: any) {
  return getNativeEvent(event).isComposing || event.keyCode === 229
}

export function isKeyboardClick(e: Pick<MouseEvent, "detail" | "clientX" | "clientY">) {
  return e.detail === 0 || (e.clientX === 0 && e.clientY === 0)
}

export function isCtrlOrMetaKey(e: Pick<KeyboardEvent, "ctrlKey" | "metaKey">) {
  if (isMac()) return e.metaKey
  return e.ctrlKey
}

export function isPrintableKey(e: Pick<KeyboardEvent, "key" | "ctrlKey" | "metaKey">): boolean {
  return e.key.length === 1 && !e.ctrlKey && !e.metaKey
}

export function isVirtualPointerEvent(e: PointerEvent) {
  return (
    (e.width === 0 && e.height === 0) ||
    (e.width === 1 && e.height === 1 && e.pressure === 0 && e.detail === 0 && e.pointerType === "mouse")
  )
}

export function isVirtualClick(e: MouseEvent | PointerEvent): boolean {
  if ((e as any).mozInputSource === 0 && e.isTrusted) return true
  if (isAndroid() && (e as PointerEvent).pointerType) {
    return e.type === "click" && e.buttons === 1
  }
  return e.detail === 0 && !(e as PointerEvent).pointerType
}

export const isLeftClick = (e: Pick<MouseEvent, "button">) => e.button === 0

export const isContextMenuEvent = (e: Pick<MouseEvent, "button" | "ctrlKey" | "metaKey">) => {
  return e.button === 2 || (isMac() && e.ctrlKey && e.button === 0)
}

export const isModifierKey = (e: Pick<KeyboardEvent, "ctrlKey" | "metaKey" | "altKey">) =>
  e.ctrlKey || e.altKey || e.metaKey

export const isTouchEvent = (event: AnyPointerEvent): event is TouchEvent =>
  "touches" in event && event.touches.length > 0

const keyMap: Record<string, string> = {
  Up: "ArrowUp",
  Down: "ArrowDown",
  Esc: "Escape",
  " ": "Space",
  ",": "Comma",
  Left: "ArrowLeft",
  Right: "ArrowRight",
}

const rtlKeyMap: Record<string, string> = {
  ArrowLeft: "ArrowRight",
  ArrowRight: "ArrowLeft",
}

export function getEventKey(event: Pick<KeyboardEvent, "key">, options: EventKeyOptions = {}) {
  const { dir = "ltr", orientation = "horizontal" } = options
  let key = event.key
  key = keyMap[key] ?? key
  const isRtl = dir === "rtl" && orientation === "horizontal"
  if (isRtl && key in rtlKeyMap) key = rtlKeyMap[key]
  return key
}

export function getNativeEvent<E>(event: E): NativeEvent<E> {
  return (event as any).nativeEvent ?? event
}

const pageKeys = new Set(["PageUp", "PageDown"])
const arrowKeys = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"])

export function getEventStep(event: Pick<KeyboardEvent, "ctrlKey" | "metaKey" | "key" | "shiftKey">) {
  if (event.ctrlKey || event.metaKey) {
    return 0.1
  } else {
    const isPageKey = pageKeys.has(event.key)
    const isSkipKey = isPageKey || (event.shiftKey && arrowKeys.has(event.key))
    return isSkipKey ? 10 : 1
  }
}

export function getEventPoint(event: any, type: "page" | "client" = "client"): { x: number; y: number } {
  const point = isTouchEvent(event) ? event.touches[0] || event.changedTouches[0] : event
  return { x: point[`${type}X`], y: point[`${type}Y`] }
}

interface DOMEventMap extends DocumentEventMap, WindowEventMap, HTMLElementEventMap {}

export const addDomEvent = <K extends keyof DOMEventMap>(
  target: MaybeFn<EventTarget | null>,
  eventName: K,
  handler: (event: DOMEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
) => {
  const node = typeof target === "function" ? target() : target
  node?.addEventListener(eventName, handler as any, options)
  return () => {
    node?.removeEventListener(eventName, handler as any, options)
  }
}
