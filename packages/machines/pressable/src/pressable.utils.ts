import { isHTMLElement } from "@zag-js/dom-query"
import type { EventPoint, Rect } from "./pressable.types"

export function isValidKeyboardEvent(event: KeyboardEvent): boolean {
  const { key, target } = event

  const element = target as HTMLElement

  const { tagName, isContentEditable } = element
  const role = element.getAttribute("role")

  if (tagName !== "INPUT" && tagName !== "TEXTAREA" && isContentEditable) return false

  return (
    (key === "Enter" || key === " ") &&
    // A link with a valid href should be handled natively,
    // unless it also has role='button' and was triggered using Space.
    (!isHTMLAnchorLink(element) || (role === "button" && key !== "Enter")) &&
    // An element with role='link' should only trigger with Enter key
    !(role === "link" && key !== "Enter")
  )
}

export function isHTMLAnchorLink(target: Element): boolean {
  return target.tagName === "A" && target.hasAttribute("href")
}

export function shouldPreventDefaultKeyboard(target: any) {
  return !(
    (target.tagName === "INPUT" || target.tagName === "BUTTON") &&
    (target as HTMLButtonElement | HTMLInputElement).type === "submit"
  )
}

export function shouldPreventDefault(target: Element) {
  return !isHTMLElement(target) || !target.draggable
}

export function isOverTarget(point: EventPoint, target: Element | null) {
  if (!target) return
  let rect = target.getBoundingClientRect()
  let pointRect = getPointClientRect(point)
  return areRectanglesOverlapping(rect, pointRect)
}

export function getPointClientRect(point: EventPoint): Rect {
  let offsetX = point.width ? point.width / 2 : point.radiusX || 0
  let offsetY = point.height ? point.height / 2 : point.radiusY || 0

  return {
    top: point.clientY - offsetY,
    right: point.clientX + offsetX,
    bottom: point.clientY + offsetY,
    left: point.clientX - offsetX,
  }
}

export function areRectanglesOverlapping(a: Rect, b: Rect) {
  // check if they cannot overlap on x axis
  if (a.left > b.right || b.left > a.right) {
    return false
  }
  // check if they cannot overlap on y axis
  if (a.top > b.bottom || b.top > a.bottom) {
    return false
  }
  return true
}
