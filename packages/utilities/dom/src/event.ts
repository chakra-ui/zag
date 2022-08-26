import type { JSX } from "@zag-js/types"
import { hasProp, isObject } from "@zag-js/utils"
import { isDom, isMac } from "./platform"
import { contains } from "./query"

export function isKeyboardClick(e: Pick<MouseEvent, "detail" | "clientX" | "clientY">) {
  return e.detail === 0 || (e.clientX === 0 && e.clientY === 0)
}

export function isPrintableKey(e: Pick<KeyboardEvent, "key" | "ctrlKey" | "metaKey">): boolean {
  return e.key.length === 1 && !e.ctrlKey && !e.metaKey
}

export function isVirtualPointerEvent(event: PointerEvent) {
  return (
    (event.width === 0 && event.height === 0) ||
    (event.width === 1 &&
      event.height === 1 &&
      event.pressure === 0 &&
      event.detail === 0 &&
      event.pointerType === "mouse")
  )
}

export function isVirtualClick(event: MouseEvent | PointerEvent): boolean {
  if ((event as any).mozInputSource === 0 && event.isTrusted) return true
  return event.detail === 0 && !(event as PointerEvent).pointerType
}

type NativeEvent<E> = JSX.ChangeEvent<any> extends E
  ? InputEvent
  : E extends JSX.SyntheticEvent<any, infer T>
  ? T
  : never

export function getNativeEvent<E>(e: E): NativeEvent<E> {
  return (e as any).nativeEvent ?? e
}

export function isSelfEvent(event: Pick<Event, "currentTarget" | "target">) {
  return contains(event.currentTarget, event.target)
}

export const supportsPointerEvent = () => isDom() && window.onpointerdown === null
export const supportsTouchEvent = () => isDom() && window.ontouchstart === null
export const supportsMouseEvent = () => isDom() && window.onmousedown === null

export const isMouseEvent = (v: any): v is MouseEvent => isObject(v) && hasProp(v, "button")
export const isTouchEvent = (v: any): v is TouchEvent => isObject(v) && hasProp(v, "touches")
export const isLeftClick = (v: { button: number }) => v.button === 0
export const isContextMenuEvent = (e: Pick<MouseEvent, "button" | "ctrlKey" | "metaKey">) => {
  return e.button === 2 || (isCtrlKey(e) && e.button === 0)
}
export const isRightClick = (v: { button: number }) => v.button === 2
export const isModifiedEvent = (v: Pick<KeyboardEvent, "ctrlKey" | "metaKey" | "altKey">) =>
  v.ctrlKey || v.altKey || v.metaKey

export const isCtrlKey = (v: Pick<KeyboardEvent, "ctrlKey" | "metaKey">) =>
  isMac() ? v.metaKey && !v.ctrlKey : v.ctrlKey && !v.metaKey
