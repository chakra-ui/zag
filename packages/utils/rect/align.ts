import { rect } from "."
import type { Rect } from "./types"

export function hAlign(a: Rect, ref: Rect, h: HAlign): Rect {
  let x = ref.x
  if (h === "left-inside") x = ref.x
  if (h === "left-outside") x = ref.x - ref.width
  if (h === "right-inside") x = ref.maxX - ref.width
  if (h === "right-outside") x = ref.maxX
  if (h === "center") x = ref.midX - ref.width / 2
  return rect(Object.assign({}, a, { x }))
}

export function vAlign(a: Rect, ref: Rect, v: VAlign): Rect {
  let y = ref.y
  if (v === "top-inside") y = ref.y
  if (v === "top-outside") y = ref.y - a.height
  if (v === "bottom-inside") y = ref.maxY - a.height
  if (v === "bottom-outside") y = ref.maxY
  if (v === "center") y = ref.midY - a.height / 2
  return rect(Object.assign({}, a, { y }))
}

export function align(a: Rect, ref: Rect, options: AlignOptions): Rect {
  const { h, v } = options
  return vAlign(hAlign(a, ref, h), ref, v)
}

export type AlignOptions = {
  h: HAlign
  v: VAlign
}

export type HAlign = "left-inside" | "left-outside" | "center" | "right-inside" | "right-outside"

export type VAlign = "top-inside" | "top-outside" | "center" | "bottom-inside" | "bottom-outside"
