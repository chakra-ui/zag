import { contains } from "./node"
import { isIos } from "./platform"
import { nextTick, raf } from "./raf"

type State = "default" | "disabled" | "restoring"

let state: State = "default"
let userSelect = ""
const elementMap = new WeakMap<HTMLElement, string>()

export interface DisableTextSelectionOptions<T = MaybeElement> {
  target?: T | undefined
  doc?: Document | undefined
  defer?: boolean | undefined
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

/**
 * Whether the user has text selected inside `el`, so a press there may be extending the selection
 */
export function hasSelectionWithin(doc: Document, el: Element | null): boolean {
  if (!el) return false
  const selection = doc.getSelection()
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return false

  try {
    const range = selection.getRangeAt(0)
    return (
      contains(el, range.commonAncestorContainer) ||
      contains(el, selection.anchorNode) ||
      contains(el, selection.focusNode) ||
      range.intersectsNode?.(el) === true
    )
  } catch {
    return false
  }
}
