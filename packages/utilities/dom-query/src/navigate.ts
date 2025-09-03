import { getWindow } from "./node"
import { isFirefox } from "./platform"
import { queueBeforeEvent } from "./raf"

export interface NavigateOptions {
  key?: string
  orientation?: "both" | "vertical" | "horizontal"
  loop?: boolean
  dir?: "ltr" | "rtl"
}

export function navigate<T extends HTMLElement>(
  items: T[],
  current: T | null,
  options: NavigateOptions = {},
): T | null {
  if (!current) return null

  const { orientation = "both", loop = true, dir = "ltr", key } = options

  if (!items.length || !key) return null
  const isVertical = key === "ArrowUp" || key === "ArrowDown"
  const isHorizontal = key === "ArrowLeft" || key === "ArrowRight"

  if (!isVertical && !isHorizontal && key !== "Home" && key !== "End") return null
  if ((orientation === "vertical" && isHorizontal) || (orientation === "horizontal" && isVertical)) return null

  if (key === "Home") return items[0] || null
  if (key === "End") return items[items.length - 1] || null

  const idx = items.indexOf(current)
  if (idx === -1) return null

  let isForward: boolean
  if (orientation === "both") {
    // When orientation is both, treat ArrowDown/Right as forward and ArrowUp/Left as backward
    isForward = key === "ArrowDown" || (dir === "ltr" ? key === "ArrowRight" : key === "ArrowLeft")
  } else {
    isForward = isVertical ? key === "ArrowDown" : dir === "ltr" ? key === "ArrowRight" : key === "ArrowLeft"
  }

  const nextIdx = isForward
    ? loop
      ? (idx + 1) % items.length
      : Math.min(idx + 1, items.length - 1)
    : loop
      ? (idx - 1 + items.length) % items.length
      : Math.max(0, idx - 1)

  return items[nextIdx] || null
}

export function clickIfLink(el: HTMLAnchorElement) {
  const click = () => {
    const win = getWindow(el)
    el.dispatchEvent(new win.MouseEvent("click"))
  }
  if (isFirefox()) {
    queueBeforeEvent(el, "keyup", click)
  } else {
    queueMicrotask(click)
  }
}
