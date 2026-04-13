import {
  getComputedStyle,
  getNearestOverflowAncestor,
  getWindow,
  isHTMLElement,
  isOverflowElement,
} from "@zag-js/dom-query"

export interface AutoScrollOptions {
  /**
   * Pixel margin from the container edges that triggers scrolling.
   */
  threshold: number
  /**
   * Maximum scroll speed in px/frame.
   * @default 4
   */
  maxSpeed?: number
}

const SCROLLABLE_RE = /(auto|scroll)/

export class AutoScroll {
  private scrollableEl: HTMLElement
  private win: Window
  private canScrollX: boolean
  private canScrollY: boolean
  private options: Required<AutoScrollOptions>
  private dx = 0
  private dy = 0
  private frameId: number | null = null

  constructor(scrollableEl: HTMLElement, options: AutoScrollOptions) {
    this.scrollableEl = scrollableEl
    this.options = { maxSpeed: 4, ...options }
    this.win = getWindow(scrollableEl)

    const style = getComputedStyle(scrollableEl)
    this.canScrollX = SCROLLABLE_RE.test(style.overflowX)
    this.canScrollY = SCROLLABLE_RE.test(style.overflowY)
  }

  canScroll() {
    return this.canScrollX || this.canScrollY
  }

  private tick = () => {
    if (this.canScrollX) this.scrollableEl.scrollLeft += this.dx
    if (this.canScrollY) this.scrollableEl.scrollTop += this.dy
    if (this.frameId != null) {
      this.frameId = this.win.requestAnimationFrame(this.tick)
    }
  }

  move = (x: number, y: number) => {
    const { threshold, maxSpeed } = this.options
    const factor = maxSpeed / threshold
    const box = this.scrollableEl.getBoundingClientRect()
    const relX = x - box.left
    const relY = y - box.top

    this.dx = 0
    this.dy = 0

    if (this.canScrollX) {
      if (relX < threshold) this.dx = Math.max(-maxSpeed, (relX - threshold) * factor)
      else if (relX > box.width - threshold) this.dx = Math.min(maxSpeed, (relX - (box.width - threshold)) * factor)
    }
    if (this.canScrollY) {
      if (relY < threshold) this.dy = Math.max(-maxSpeed, (relY - threshold) * factor)
      else if (relY > box.height - threshold) this.dy = Math.min(maxSpeed, (relY - (box.height - threshold)) * factor)
    }

    if ((this.dx !== 0 || this.dy !== 0) && this.frameId == null) {
      this.frameId = this.win.requestAnimationFrame(this.tick)
    } else if (this.dx === 0 && this.dy === 0 && this.frameId != null) {
      this.stop()
    }
  }

  stop = () => {
    if (this.frameId != null) {
      this.win.cancelAnimationFrame(this.frameId)
      this.frameId = null
    }
  }
}

export function createAutoScroll(el: HTMLElement, options: AutoScrollOptions): AutoScroll | null {
  const scrollableEl = findScrollableElement(el)
  if (!scrollableEl) return null

  const autoScroll = new AutoScroll(scrollableEl, options)
  return autoScroll.canScroll() ? autoScroll : null
}

function findScrollableElement(el: HTMLElement): HTMLElement | null {
  if (isOverflowElement(el)) return el

  for (const child of el.children) {
    if (isHTMLElement(child) && isOverflowElement(child)) return child
  }

  const ancestor = getNearestOverflowAncestor(el)
  if (ancestor && ancestor !== el.ownerDocument.body) return ancestor

  return null
}
