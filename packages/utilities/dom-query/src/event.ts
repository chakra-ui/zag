import { isApple } from "./platform"

export function getBeforeInputValue(event: Pick<InputEvent, "currentTarget">) {
  const { selectionStart, selectionEnd, value } = event.currentTarget as HTMLInputElement
  return value.slice(0, selectionStart!) + (event as any).data + value.slice(selectionEnd!)
}

export function getEventTarget<T extends EventTarget>(event: Pick<UIEvent, "target" | "composedPath">): T | null {
  return (event.composedPath?.()[0] ?? event.target) as T | null
}

export const isSelfTarget = (
  event: Pick<UIEvent, "currentTarget" | "target" | "composedPath">,
  getTarget?: (node: Element) => Element | null,
) => {
  let target = getEventTarget<Element>(event)
  if (getTarget && target) {
    target = getTarget(target) ?? target
  }
  return event.currentTarget === target
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
