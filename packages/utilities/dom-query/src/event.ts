import { contains } from "./contains"
import { isApple } from "./platform"

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
  return event.nativeEvent?.isComposing ?? event.isComposing
}
