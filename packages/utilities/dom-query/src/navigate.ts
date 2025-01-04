import { isFirefox } from "./platform"
import { queueBeforeEvent } from "./raf"

export function clickIfLink(el: HTMLAnchorElement) {
  const click = () => el.click()
  if (isFirefox()) {
    queueBeforeEvent(el, "keyup", click)
  } else {
    queueMicrotask(click)
  }
}
