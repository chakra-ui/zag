import { isIos, nextTick, raf } from "@zag-js/dom-query"

type State = "default" | "disabled" | "restoring"

let state: State = "default"
let userSelect = ""
const elementMap = new WeakMap<HTMLElement, string>()

export interface DisableTextSelectionOptions<T = MaybeElement> {
  target?: T
  doc?: Document
  defer?: boolean
}

function disableTextSelectionImpl(options: DisableTextSelectionOptions = {}) {
  const { target, doc } = options

  const docNode = doc ?? document
  const rootEl = docNode.documentElement

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

  return () => restoreTextSelection({ target, doc: docNode })
}

export function restoreTextSelection(options: DisableTextSelectionOptions = {}) {
  const { target, doc } = options

  const docNode = doc ?? document
  const rootEl = docNode.documentElement

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
      const prevUserSelect = elementMap.get(target)

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

type MaybeElement = HTMLElement | null | undefined

type NodeOrFn = MaybeElement | (() => MaybeElement)

export function disableTextSelection(options: DisableTextSelectionOptions<NodeOrFn> = {}) {
  const { defer, target, ...restOptions } = options
  const func = defer ? raf : (v: any) => v()
  const cleanups: (VoidFunction | undefined)[] = []
  cleanups.push(
    func(() => {
      const node = typeof target === "function" ? target() : target
      cleanups.push(disableTextSelectionImpl({ ...restOptions, target: node }))
    }),
  )
  return () => {
    cleanups.forEach((fn) => fn?.())
  }
}
