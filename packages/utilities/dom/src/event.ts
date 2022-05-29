import { contains } from "./query"

export function isKeyboardClick(e: Pick<MouseEvent, "detail" | "clientX" | "clientY">) {
  return e.detail === 0 || (e.clientX === 0 && e.clientY === 0)
}

export function isPrintableKey(e: Pick<KeyboardEvent, "key" | "ctrlKey" | "metaKey">): boolean {
  return e.key.length === 1 && !e.ctrlKey && !e.metaKey
}

type NativeEvent<E> = React.ChangeEvent<any> extends E
  ? InputEvent
  : E extends React.SyntheticEvent<any, infer T>
  ? T
  : never

export function getNativeEvent<E>(e: E): NativeEvent<E> {
  return (e as any).nativeEvent ?? e
}

export function queueBeforeEvent(el: Element, type: string, fn: VoidFunction) {
  const raf = requestAnimationFrame(() => {
    el.removeEventListener(type, invoke, true)
    fn()
  })

  const invoke = () => {
    cancelAnimationFrame(raf)
    fn()
  }

  el.addEventListener(type, invoke, { once: true, capture: true })

  return raf
}

export function isPortalEvent(event: Pick<Event, "currentTarget" | "target">): boolean {
  return !contains(event.currentTarget, event.target)
}

export function isSelfTarget(event: Pick<Event, "target" | "currentTarget">): boolean {
  return event.target === event.currentTarget
}
