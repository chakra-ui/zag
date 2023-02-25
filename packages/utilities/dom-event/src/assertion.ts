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
  return e.button === 2 || (isCtrlKey(e) && e.button === 0)
}

export const isModifiedEvent = (e: Pick<KeyboardEvent, "ctrlKey" | "metaKey" | "altKey">) =>
  e.ctrlKey || e.altKey || e.metaKey

const isMac = () => /Mac|iPod|iPhone|iPad/.test(window.navigator.platform)

export const isCtrlKey = (e: Pick<KeyboardEvent, "ctrlKey" | "metaKey">) =>
  isMac() ? e.metaKey && !e.ctrlKey : e.ctrlKey && !e.metaKey
