import { JSX } from "@zag-js/types"
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
