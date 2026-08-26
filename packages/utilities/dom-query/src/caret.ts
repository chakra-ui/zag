import { getComputedStyle } from "./computed-style"
import { isFirefox } from "./platform"

export interface CaretPosition {
  /**
   * The left position of the caret, in pixels, relative to the element's
   * bounding client rect (scroll offsets are already accounted for).
   */
  left: number
  /**
   * The top position of the caret, in pixels, relative to the element's
   * bounding client rect (scroll offsets are already accounted for).
   */
  top: number
  /**
   * The height of the caret, in pixels (the element's line height).
   */
  height: number
}

export interface GetCaretPositionOptions {
  /**
   * The character index to measure the caret at.
   * @default the element's `selectionStart`
   */
  position?: number | undefined
}

// Listed explicitly because browsers don't expand shorthands in computed styles consistently
const MIRROR_PROPERTIES = [
  "direction",
  "box-sizing",
  "width",
  "height",
  "overflow-x",
  "overflow-y",
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "border-style",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "font-style",
  "font-variant",
  "font-weight",
  "font-stretch",
  "font-size",
  "font-size-adjust",
  "line-height",
  "font-family",
  "text-align",
  "text-transform",
  "text-indent",
  "text-decoration",
  "letter-spacing",
  "word-spacing",
  "tab-size",
  "-moz-tab-size",
]

// single-line inputs center their text, so line height must match the rendered content height
function getInputLineHeight(computed: CSSStyleDeclaration): string {
  if (computed.boxSizing !== "border-box") return computed.height
  const height = parseFloat(computed.height)
  const outerHeight =
    parseFloat(computed.paddingTop) +
    parseFloat(computed.paddingBottom) +
    parseFloat(computed.borderTopWidth) +
    parseFloat(computed.borderBottomWidth)
  const targetHeight = outerHeight + parseFloat(computed.lineHeight)
  if (Number.isNaN(targetHeight)) return computed.height
  if (height > targetHeight) return `${height - outerHeight}px`
  if (height === targetHeight) return computed.lineHeight
  return "0"
}

function getMirrorStyle(
  element: HTMLInputElement | HTMLTextAreaElement,
  computed: CSSStyleDeclaration,
  isInput: boolean,
): string {
  const style: string[] = []

  for (const prop of MIRROR_PROPERTIES) {
    const value = isInput && prop === "line-height" ? getInputLineHeight(computed) : computed.getPropertyValue(prop)
    style.push(`${prop}:${value}`)
  }

  // `visibility: hidden` (not `display: none`) because the mirror must render to be measurable
  style.push("position:absolute", "visibility:hidden", "white-space:pre-wrap")
  if (!isInput) style.push("word-wrap:break-word")

  // Firefox lies about the overflow property for textareas: https://bugzilla.mozilla.org/show_bug.cgi?id=984275
  if (isFirefox()) {
    if (element.scrollHeight > parseFloat(computed.height)) style.push("overflow-y:scroll")
  } else {
    style.push("overflow:hidden")
  }

  return style.join(";")
}

interface MirrorEntry {
  mirror: HTMLDivElement
  textNode: Text
  marker: HTMLSpanElement
}

// one mirror per document, reused across calls to avoid per-keystroke node churn
const mirrorCache = new WeakMap<Document, MirrorEntry>()

function getMirrorEntry(doc: Document): MirrorEntry {
  let entry = mirrorCache.get(doc)
  if (!entry) {
    const mirror = doc.createElement("div")
    const textNode = doc.createTextNode("")
    const marker = doc.createElement("span")
    mirror.append(textNode, marker)
    entry = { mirror, textNode, marker }
    mirrorCache.set(doc, entry)
  }
  return entry
}

/**
 * Measures the caret position in an input or textarea using a hidden mirror
 * element that replicates the element's typography and box model.
 *
 * Returns coordinates relative to the element's bounding client rect, so
 * viewport coordinates are `rect.x + left` and `rect.y + top`.
 */
export function getCaretPosition(
  element: HTMLInputElement | HTMLTextAreaElement,
  options: GetCaretPositionOptions = {},
): CaretPosition {
  const { position = element.selectionStart ?? element.value.length } = options

  const doc = element.ownerDocument
  const computed = getComputedStyle(element)
  const isInput = element.localName === "input"

  const { mirror, textNode, marker } = getMirrorEntry(doc)

  mirror.style.cssText = getMirrorStyle(element, computed, isInput)

  let textBeforeCaret = element.value.substring(0, position)
  // inputs collapse whitespace; use non-breaking spaces so the mirror measures it
  if (isInput) textBeforeCaret = textBeforeCaret.replace(/\s/g, "\u00a0")
  textNode.data = textBeforeCaret

  // the rest of the value must be in the marker so word wrapping is replicated exactly;
  // the "." fallback ensures an empty marker still renders
  marker.textContent = element.value.substring(position) || "."

  doc.body.appendChild(mirror)

  const top = marker.offsetTop + parseFloat(computed.borderTopWidth) - element.scrollTop
  const left = marker.offsetLeft + parseFloat(computed.borderLeftWidth) - element.scrollLeft
  // line-height can compute to "normal"
  const height = parseFloat(computed.lineHeight) || parseFloat(computed.fontSize) * 1.2

  mirror.remove()

  // don't retain copies of the value in the cached mirror
  textNode.data = ""
  marker.textContent = ""

  return { top, left, height }
}

export function isCaretAtStart(input: HTMLInputElement | HTMLTextAreaElement | null) {
  if (!input) return false
  try {
    return input.selectionStart === 0 && input.selectionEnd === 0
  } catch {
    return input.value === ""
  }
}

export function setCaretToEnd(input: HTMLInputElement | HTMLTextAreaElement | null) {
  if (!input) return
  try {
    if (input.ownerDocument.activeElement !== input) return
    const len = input.value.length
    input.setSelectionRange(len, len)
  } catch {}
}
