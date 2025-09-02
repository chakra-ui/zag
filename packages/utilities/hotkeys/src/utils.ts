import type { RootNode } from "./types"

const typeOf = (value: unknown) => Object.prototype.toString.call(value).slice(8, -1)
const isDocument = (value: unknown): value is Document => typeOf(value) === "Document"

export function getDoc(root: RootNode): Document {
  return isDocument(root) ? root : root.ownerDocument || document
}

export function getWin(root: RootNode): Window {
  return getDoc(root).defaultView || window
}

// Detect platform
const NA_REGEX = /Mac|iPod|iPhone|iPad/
export function isMac(): boolean {
  return typeof navigator !== "undefined" && NA_REGEX.test(navigator.userAgent)
}

// Key mapping utilities
const CODE_REGEX = /^(digit|numpad|key)/
const ARROW_REGEX = /^arrow/
export function mapCode(code: string): string {
  return code.toLowerCase().replace(CODE_REGEX, "").replace(ARROW_REGEX, "")
}

// Resolve ctrlOrMeta to appropriate modifier based on platform
export function resolveCtrlOrMeta(key: string): string {
  if (key === "{ctrl|meta}") return isMac() ? "meta" : "ctrl"
  return key
}
