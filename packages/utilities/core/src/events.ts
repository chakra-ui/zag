import { hasProp, isDom, isObject } from "./guard"
import { isMac } from "./platform"

export const supportsPointerEvent = () => isDom() && window.onpointerdown === null
export const supportsTouchEvent = () => isDom() && window.ontouchstart === null
export const supportsMouseEvent = () => isDom() && window.onmousedown === null

export const isMouseEvent = (v: any): v is MouseEvent => isObject(v) && hasProp(v, "button")
export const isTouchEvent = (v: any): v is TouchEvent => isObject(v) && hasProp(v, "touches")
export const isLeftClick = (v: { button: number }) => v.button === 0
export const isRightClick = (v: { button: number }) => v.button === 2
export const isModifiedEvent = (v: Pick<KeyboardEvent, "ctrlKey" | "metaKey" | "altKey">) =>
  v.ctrlKey || v.altKey || v.metaKey

export const isCtrlKey = (v: Pick<KeyboardEvent, "ctrlKey" | "metaKey">) =>
  isMac() ? v.metaKey && !v.ctrlKey : v.ctrlKey && !v.metaKey
