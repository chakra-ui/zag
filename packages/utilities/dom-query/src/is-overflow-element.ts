import { getWindow } from "./env"

const OVERFLOW_RE = /auto|scroll|overlay|hidden|clip/

export function isOverflowElement(el: HTMLElement): boolean {
  const win = getWindow(el)
  const { overflow, overflowX, overflowY, display } = win.getComputedStyle(el)
  return OVERFLOW_RE.test(overflow + overflowY + overflowX) && !["inline", "contents"].includes(display)
}
