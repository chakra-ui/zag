import type { Point } from "."
import { point } from "."

const isObj = (e: any): e is Record<string, any> => Object.prototype.toString.call(e) === "[object Object]"

const isTouchEvent = (e: any): e is TouchEvent => isObj(e) && "touches" in e
type PointType = "page" | "client"
type Event = MouseEvent | TouchEvent | PointerEvent

const fallback = { pageX: 0, pageY: 0, clientX: 0, clientY: 0 }

export function fromPointerEvent(e: Event, t: PointType = "page"): Point {
  const p = isTouchEvent(e) ? e.touches[0] || e.changedTouches[0] || fallback : e
  return point(p[`${t}X`], p[`${t}Y`])
}

type RelativeValue = {
  point: Point
  progress: { x: number; y: number }
}

export function relativeToNode(p: Point, el: HTMLElement): RelativeValue {
  const dx = p.x - el.offsetLeft - el.clientLeft + el.scrollLeft
  const dy = p.y - el.offsetTop - el.clientTop + el.scrollTop
  return {
    point: point(dx, dy),
    progress: { x: dx / el.offsetWidth, y: dy / el.offsetHeight },
  }
}
