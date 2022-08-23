import { isHTMLElement } from "@zag-js/dom-utils"
import type { EventPoint, Rect } from "./pressable.types"

export const utils = {
  isValidKeyboardEvent(event: KeyboardEvent): boolean {
    const { key, target } = event

    const element = target as HTMLElement

    const { tagName, isContentEditable } = element
    const role = element.getAttribute("role")

    if (tagName !== "INPUT" && tagName !== "TEXTAREA" && isContentEditable) return false

    return (
      (key === "Enter" || key === " ") &&
      // A link with a valid href should be handled natively,
      // unless it also has role='button' and was triggered using Space.
      (!utils.isHTMLAnchorLink(element) || (role === "button" && key !== "Enter")) &&
      // An element with role='link' should only trigger with Enter key
      !(role === "link" && key !== "Enter")
    )
  },

  isHTMLAnchorLink(target: Element): boolean {
    return target.tagName === "A" && target.hasAttribute("href")
  },

  shouldPreventDefaultKeyboard(target: Element) {
    return !(
      (target.tagName === "INPUT" || target.tagName === "BUTTON") &&
      (target as HTMLButtonElement | HTMLInputElement).type === "submit"
    )
  },

  shouldPreventDefault(target: Element) {
    return !isHTMLElement(target) || !target.draggable
  },

  isOverTarget(point: EventPoint, target: Element | null) {
    if (!target) return
    let rect = target.getBoundingClientRect()
    let pointRect = utils.getPointClientRect(point)
    return utils.areRectanglesOverlapping(rect, pointRect)
  },

  getPointClientRect(point: EventPoint): Rect {
    let offsetX = point.width ? point.width / 2 : point.radiusX || 0
    let offsetY = point.height ? point.height / 2 : point.radiusY || 0

    return {
      top: point.clientY - offsetY,
      right: point.clientX + offsetX,
      bottom: point.clientY + offsetY,
      left: point.clientX - offsetX,
    }
  },

  areRectanglesOverlapping(a: Rect, b: Rect) {
    // check if they cannot overlap on x axis
    if (a.left > b.right || b.left > a.right) {
      return false
    }
    // check if they cannot overlap on y axis
    if (a.top > b.bottom || b.top > a.bottom) {
      return false
    }
    return true
  },
}
