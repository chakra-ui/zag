// Credits: https://github.com/adobe/react-spectrum/blob/e81cfec20056338c7987c513826dc45df32f3db4/packages/%40react-aria/interactions/src/textSelection.ts
import { isIos } from "@ui-machines/utils"
import { nextTick } from "./next-tick"

type State = "default" | "disabled" | "restoring"

let state: State = "default"
let cache: CSSStyleDeclaration["userSelect"] = ""
let map = new WeakMap<HTMLElement, string>()

const isDocument = (target: Document | HTMLElement): target is Document =>
  "[object HTMLDocument]" === Object.prototype.toString.call(target)

export function disableTextSelection(target: Document | HTMLElement) {
  const doc = isDocument(target) ? target : target.ownerDocument
  const root = doc.documentElement

  if (isIos()) {
    if (state === "default") {
      cache = root.style.webkitUserSelect
      root.style.webkitUserSelect = "none"
    }
    state = "disabled"
  } else if (!isDocument(target)) {
    map.set(target, target.style.userSelect)
    target.style.userSelect = "none"
  }

  return function restoreTextSelection() {
    if (isIos()) {
      if (state !== "disabled") return
      state = "restoring"
      nextTick(() => {
        if (state === "restoring") {
          if (root.style.webkitUserSelect === "none") {
            root.style.webkitUserSelect = cache ?? ""
          }
          cache = ""
          state = "default"
        }
      })
    } else {
      if (!isDocument(target) && map.has(target)) {
        let targetOldUserSelect = map.get(target)

        if (target.style.userSelect === "none") {
          target.style.userSelect = targetOldUserSelect ?? ""
        }

        map.delete(target)
      }
    }
  }
}
