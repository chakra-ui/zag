import type { FormTagName, Platform, RootNode } from "./types"

const typeOf = (value: unknown) => Object.prototype.toString.call(value).slice(8, -1)
const isDocument = (value: unknown): value is Document => typeOf(value) === "Document"

export function getDoc(root: RootNode): Document {
  return isDocument(root) ? root : root.ownerDocument || document
}

export function getWin(root: RootNode): Window {
  return getDoc(root).defaultView || window
}

const FORM_TAGS = new Set(["input", "textarea", "select"])
export const isFormTag = (tagName: string): tagName is FormTagName => FORM_TAGS.has(tagName)

// Hotkey parsing constants
export const MODIFIER_SEPARATOR = "+"
export const SEQUENCE_SEPARATOR = ">"

export const isHTMLElement = (target: unknown): target is HTMLElement => {
  return (
    target !== null &&
    typeof target === "object" &&
    "localName" in target &&
    "nodeType" in target &&
    target.nodeType === 1
  )
}

export const getEventTarget = (event: KeyboardEvent): Element | null => {
  const target = event.composedPath?.()[0] || event.target
  return isHTMLElement(target) ? target : null
}

const NA_REGEX = /Mac|iPod|iPhone|iPad/
const isMac = () => typeof navigator !== "undefined" && NA_REGEX.test(navigator.userAgent)

export const getPlatform = (): Platform => (isMac() ? "mac" : "windows")

export const toArray = <T>(value: T | T[]): T[] => {
  if (Array.isArray(value)) {
    return value.filter((item) => item !== undefined)
  }
  return value !== undefined ? [value] : []
}
