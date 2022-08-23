import type { EventPoint, Rect } from "./pressable.types"

export const utils = {
  isValidKeyboardEvent(event: KeyboardEvent, currentTarget: Element): boolean {
    const { key, code } = event
    const element = currentTarget as HTMLElement
    const { tagName, isContentEditable } = element
    const role = element.getAttribute("role")
    // Accessibility for keyboards. Space and Enter only.
    // "Spacebar" is for IE 11
    return (
      (key === "Enter" || key === " " || key === "Spacebar" || code === "Space") &&
      tagName !== "INPUT" &&
      tagName !== "TEXTAREA" &&
      isContentEditable !== true &&
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
  shouldPreventDefault: (target: Element) => !(target instanceof HTMLElement) || !target.draggable,
  isVirtualPointerEvent(event: PointerEvent | null) {
    // If the pointer size is zero, then we assume it's from a screen reader.
    // Android TalkBack double tap will sometimes return a event with width and height of 1
    // and pointerType === 'mouse' so we need to check for a specific combination of event attributes.
    // Cannot use "event.pressure === 0" as the sole check due to Safari pointer events always returning pressure === 0
    // instead of .5, see https://bugs.webkit.org/show_bug.cgi?id=206216. event.pointerType === 'mouse' is to distingush
    // Talkback double tap from Windows Firefox touch screen press
    return (
      (event?.width === 0 && event.height === 0) ||
      (event?.width === 1 &&
        event.height === 1 &&
        event.pressure === 0 &&
        event.detail === 0 &&
        event.pointerType === "mouse")
    )
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
