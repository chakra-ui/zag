import { contains } from "./contains"

export function getBeforeInputValue(event: Pick<InputEvent, "currentTarget">) {
  const { selectionStart, selectionEnd, value } = event.currentTarget as HTMLInputElement
  return value.slice(0, selectionStart!) + (event as any).data + value.slice(selectionEnd!)
}

export function getEventTarget<T extends EventTarget>(event: Event): T | null {
  return (event.composedPath?.()[0] ?? event.target) as T | null
}

export const isSelfEvent = (event: Pick<UIEvent, "currentTarget" | "target">) =>
  contains(event.currentTarget, event.target)
