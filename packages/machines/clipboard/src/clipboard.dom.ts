import type { Scope } from "@zag-js/core"
import { getWindow } from "@zag-js/dom-query"
import { parts } from "./clipboard.anatomy"

export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getInputId = (ctx: Scope) => ctx.ids?.input ?? `${ctx.id}:input`
export const getLabelId = (ctx: Scope) => ctx.ids?.label ?? `${ctx.id}:label`
export const getInputEl = (ctx: Scope) => ctx.query<HTMLInputElement>(ctx.selector(parts.input))
export const writeToClipboard = (ctx: Scope, value: string) => copyText(ctx.getDoc(), value)

function createNode(doc: Document, text: string): HTMLElement {
  const node = doc.createElement("pre")
  Object.assign(node.style, {
    width: "1px",
    height: "1px",
    position: "fixed",
    top: "5px",
  })
  node.textContent = text
  return node
}

function copyNode(node: HTMLElement): Promise<void> {
  const win = getWindow(node)

  const selection = win.getSelection()

  if (selection == null) {
    return Promise.reject(new Error())
  }

  selection.removeAllRanges()

  const doc = node.ownerDocument

  const range = doc.createRange()
  range.selectNodeContents(node)
  selection.addRange(range)

  doc.execCommand("copy")
  selection.removeAllRanges()

  return Promise.resolve()
}

function copyText(doc: Document, text: string): Promise<void> {
  const win = doc.defaultView || window

  if (win.navigator.clipboard?.writeText !== undefined) {
    return win.navigator.clipboard.writeText(text)
  }

  if (!doc.body) {
    return Promise.reject(new Error())
  }

  const node = createNode(doc, text)

  doc.body.appendChild(node)
  copyNode(node)
  doc.body.removeChild(node)

  return Promise.resolve()
}
