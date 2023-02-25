type State = "default" | "disabled" | "restoring"

let state: State = "default"
let userSelect = ""
let elementMap = new WeakMap<HTMLElement, string>()

const isIos = () => {
  const userAgent = navigator.userAgent.toLowerCase()
  return /iphone|ipad|ipod/.test(userAgent)
}

const nextTick = (fn: () => void) => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      fn()
    })
  })
}

export function disableTextSelection({ target, doc }: { target?: HTMLElement; doc?: Document } = {}) {
  const _document = doc ?? document
  const rootEl = _document.documentElement

  if (isIos()) {
    if (state === "default") {
      userSelect = rootEl.style.webkitUserSelect
      rootEl.style.webkitUserSelect = "none"
    }

    state = "disabled"
  } else if (target) {
    elementMap.set(target, target.style.userSelect)
    target.style.userSelect = "none"
  }

  return () => restoreTextSelection({ target, doc: _document })
}

export function restoreTextSelection({ target, doc }: { target?: HTMLElement; doc?: Document } = {}) {
  const _document = doc ?? document
  const rootEl = _document.documentElement

  if (isIos()) {
    if (state !== "disabled") return
    state = "restoring"

    setTimeout(() => {
      nextTick(() => {
        if (state === "restoring") {
          if (rootEl.style.webkitUserSelect === "none") {
            rootEl.style.webkitUserSelect = userSelect || ""
          }
          userSelect = ""
          state = "default"
        }
      })
    }, 300)
  } else {
    if (target && elementMap.has(target)) {
      let prevUserSelect = elementMap.get(target)

      if (target.style.userSelect === "none") {
        target.style.userSelect = prevUserSelect ?? ""
      }

      if (target.getAttribute("style") === "") {
        target.removeAttribute("style")
      }
      elementMap.delete(target)
    }
  }
}
