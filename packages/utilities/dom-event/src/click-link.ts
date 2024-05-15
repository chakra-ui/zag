import { isFirefox } from "@zag-js/dom-query"
import { queueBeforeEvent } from "./queue-before-event"

function isLinkElement(element: HTMLElement | null | undefined) {
  return element?.matches("a[href]") ?? false
}

export function clickIfLink(element: HTMLElement | null | undefined) {
  if (!isLinkElement(element)) return
  const click = () => element!.click()
  if (isFirefox()) {
    queueBeforeEvent(element!, "keyup", click)
  } else {
    queueMicrotask(click)
  }
}
