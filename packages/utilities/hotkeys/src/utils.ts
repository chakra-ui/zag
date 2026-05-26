import type { FormTagName, HotkeyTarget, Platform } from "./types"

const typeOf = (value: unknown) => Object.prototype.toString.call(value).slice(8, -1)
const isDocument = (value: unknown): value is Document => typeOf(value) === "Document"

export function getDoc(root: HotkeyTarget): Document {
  return isDocument(root) ? root : root.ownerDocument || document
}

export function getWin(root: HotkeyTarget): Window & typeof globalThis {
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

export const isContentEditableElement = (target: Element | null): boolean => {
  if (!target) return false
  return isHTMLElement(target) && target.isContentEditable
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

// Symbol/punctuation keys are layout-dependent: different keyboard layouts
// place them on different physical keys, often requiring Shift or AltGr.
// Any single Unicode letter or digit uses code-based matching like ASCII.
// Named keys (Enter, F1, ArrowLeft, …) are length !== 1 and are not symbols here.
const UNICODE_LETTER = /^\p{L}$/u
const UNICODE_NUMBER = /^\p{N}$/u

export const isSymbolKey = (key: string): boolean => {
  if (key.length !== 1) return false
  if (UNICODE_LETTER.test(key) || UNICODE_NUMBER.test(key)) return false
  return true
}
