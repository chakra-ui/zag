import { isAnchorElement } from "./node"
import { isFirefox } from "./platform"
import { queueBeforeEvent } from "./raf"

export function clickIfLink(el: HTMLElement | null | undefined) {
  if (!el || !isAnchorElement(el)) return
  const click = () => el.click()
  if (isFirefox()) {
    queueBeforeEvent(el, "keyup", click)
  } else {
    queueMicrotask(click)
  }
}
