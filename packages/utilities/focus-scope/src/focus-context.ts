import { getDocument, getWindow } from "@zag-js/dom-query"
import { getTabbables } from "@zag-js/tabbable"
import { createScope } from "./focus-stack"

export function createFocusContext(node: HTMLElement) {
  const ctx = {
    node,
    doc: getDocument(node),
    win: getWindow(node),
    focusScope: createScope(node),
    tabbables() {
      return getTabbables(node, true).filter((el) => !el.hasAttribute("data-focus-trap"))
    },
    firstTabbable() {
      return ctx.tabbables()[0]
    },
    lastTabbable() {
      const items = ctx.tabbables()
      return items[items.length - 1]
    },
  }
  return ctx
}

export type FocusContext = ReturnType<typeof createFocusContext>
