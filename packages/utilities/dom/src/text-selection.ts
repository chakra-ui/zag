// Credits: https://github.com/adobe/react-spectrum/blob/e81cfec20056338c7987c513826dc45df32f3db4/packages/%40react-aria/interactions/src/textSelection.ts
import { nextTick } from "./next-tick"
import { isIos } from "./platform"

type State = "default" | "disabled" | "restoring"

let state: State = "default"
let savedUserSelect = ""
let modifiedElementMap = new WeakMap<HTMLElement, string>()

export function disableTextSelection({ target, doc }: { target?: HTMLElement; doc?: Document } = {}) {
  const _document = doc ?? document

  if (isIos()) {
    if (state === "default") {
      savedUserSelect = _document.documentElement.style.webkitUserSelect
      _document.documentElement.style.webkitUserSelect = "none"
    }

    state = "disabled"
  } else if (target) {
    modifiedElementMap.set(target, target.style.userSelect)
    target.style.userSelect = "none"
  }

  return () => restoreTextSelection({ target, doc: _document })
}

export function restoreTextSelection({ target, doc }: { target?: HTMLElement; doc?: Document } = {}) {
  const _document = doc ?? document

  if (isIos()) {
    if (state !== "disabled") return
    state = "restoring"

    setTimeout(() => {
      nextTick(() => {
        if (state === "restoring") {
          if (_document.documentElement.style.webkitUserSelect === "none") {
            _document.documentElement.style.webkitUserSelect = savedUserSelect || ""
          }

          savedUserSelect = ""
          state = "default"
        }
      })
    }, 300)
  } else {
    if (target && modifiedElementMap.has(target)) {
      let targetOldUserSelect = modifiedElementMap.get(target)

      if (target.style.userSelect === "none") {
        target.style.userSelect = targetOldUserSelect ?? ""
      }

      if (target.getAttribute("style") === "") {
        target.removeAttribute("style")
      }
      modifiedElementMap.delete(target)
    }
  }
}
