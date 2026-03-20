import {
  contains,
  getEventTarget,
  isEditableElement,
  isHTMLElement,
  isInputElement,
  isLeftClick,
} from "@zag-js/dom-query"
import type { JSX } from "@zag-js/types"

const NO_DRAG_DATA_ATTR = "data-no-drag"
const NO_DRAG_SELECTOR = `[${NO_DRAG_DATA_ATTR}]`

/**
 * Elements that need to keep browser-native pointer/touch behavior and must not
 * participate in drawer dragging (e.g. native range sliders, text fields, selection).
 */
export function isDragExemptElement(el: EventTarget | null | undefined): boolean {
  if (!isHTMLElement(el)) return false
  if (el.closest(NO_DRAG_SELECTOR)) return true

  let node: HTMLElement | null = el
  while (node) {
    if (isEditableElement(node)) return true
    node = node.parentElement
  }

  const input = el.closest("input")
  if (isInputElement(input)) {
    const type = input.type
    if (type === "range" || type === "file") return true
  }
  return false
}

/**
 * Non-collapsed selection whose range or caret endpoints live inside the drawer content
 * (including shadow roots hosted under the content node).
 */
export function isTextSelectionInDrawer(doc: Document, contentEl: HTMLElement | null): boolean {
  if (!contentEl) return false
  const sel = doc.getSelection()
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return false
  try {
    const range = sel.getRangeAt(0)
    if (contains(contentEl, range.commonAncestorContainer)) return true
    if (contains(contentEl, sel.anchorNode)) return true
    if (contains(contentEl, sel.focusNode)) return true
    if (typeof range.intersectsNode === "function" && range.intersectsNode(contentEl)) {
      return true
    }
  } catch {
    return false
  }
  return false
}

export function isDragExemptFromComposedPath(event: {
  target: EventTarget | null
  composedPath?: () => EventTarget[]
}): boolean {
  const path = typeof event.composedPath === "function" ? event.composedPath() : []
  for (const node of path) {
    if (isDragExemptElement(node)) return true
  }
  return isDragExemptElement(event.target)
}

/** True when this pointer down should not arm drawer drag (wrong button, no-drag, or exempt target). */
export function shouldIgnorePointerDownForDrag(event: JSX.PointerEvent<HTMLElement>): boolean {
  if (!isLeftClick(event)) return true
  const target = getEventTarget<HTMLElement>(event)
  if (target?.hasAttribute(NO_DRAG_DATA_ATTR) || target?.closest(NO_DRAG_SELECTOR)) return true
  if (isDragExemptFromComposedPath(event)) return true
  return false
}
