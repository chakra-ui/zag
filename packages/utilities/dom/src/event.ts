import { JSX } from "@zag-js/types"
import { contains } from "./query"

export function isKeyboardClick(e: Pick<MouseEvent, "detail" | "clientX" | "clientY">) {
  return e.detail === 0 || (e.clientX === 0 && e.clientY === 0)
}

export function isPrintableKey(e: Pick<KeyboardEvent, "key" | "ctrlKey" | "metaKey">): boolean {
  return e.key.length === 1 && !e.ctrlKey && !e.metaKey
}

type NativeEvent<E> = JSX.ChangeEvent<any> extends E
  ? InputEvent
  : E extends JSX.SyntheticEvent<any, infer T>
  ? T
  : never

export function getNativeEvent<E>(e: E): NativeEvent<E> {
  return (e as any).nativeEvent ?? e
}

export function isPortalEvent(event: Pick<Event, "currentTarget" | "target">): boolean {
  return !contains(event.currentTarget, event.target)
}

export function isSelfTarget(event: Pick<Event, "target" | "currentTarget">): boolean {
  return event.target === event.currentTarget
}
