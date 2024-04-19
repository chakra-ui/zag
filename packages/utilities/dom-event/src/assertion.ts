import { isMac } from "@zag-js/dom-query"

export function isKeyboardClick(e: Pick<MouseEvent, "detail" | "clientX" | "clientY">) {
  return e.detail === 0 || (e.clientX === 0 && e.clientY === 0)
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
  return e.detail === 0 && !(e as PointerEvent).pointerType
}

export const isLeftClick = (e: Pick<MouseEvent, "button">) => e.button === 0

export const isContextMenuEvent = (e: Pick<MouseEvent, "button" | "ctrlKey" | "metaKey">) => {
  return e.button === 2 || (isMac() && e.ctrlKey && e.button === 0)
}

export const isModifierKey = (e: Pick<KeyboardEvent, "ctrlKey" | "metaKey" | "altKey">) =>
  e.ctrlKey || e.altKey || e.metaKey
