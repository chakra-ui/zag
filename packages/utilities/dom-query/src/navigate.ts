import { getWindow } from "./node"
import { isFirefox } from "./platform"
import { queueBeforeEvent } from "./raf"

export function clickIfLink(el: HTMLAnchorElement) {
  const click = () => {
    const win = getWindow(el)
    el.dispatchEvent(new win.MouseEvent("click"))
  }
  if (isFirefox()) {
    queueBeforeEvent(el, "keyup", click)
  } else {
    queueMicrotask(click)
  }
}
