import type { Scope } from "@zag-js/core"
import { parts } from "./number-flow.anatomy"
import { DIGIT_TRACK_TRANSITION, getTrackTransform } from "./number-flow.style"

// ID generators — only for parts referenced by ARIA attributes
export const getRootId = (ctx: Scope) => ctx.ids?.root ?? `${ctx.id}`
export const getValueTextId = (ctx: Scope) => ctx.ids?.valueText ?? `${ctx.id}:value-text`

// Element lookups — use querySelector with merged data attributes
export const getRootEl = (ctx: Scope) => ctx.query(ctx.selector(parts.root))
export const getDigitTrackEl = (ctx: Scope, place: number) =>
  ctx.query(`${ctx.selector(parts.digitTrack)}[data-place="${place}"]`)
export const getDigitTrackEls = (ctx: Scope) => ctx.queryAll(ctx.selector(parts.digitTrack))
export const isDigitTrackEl = (ctx: Scope, el: Element | null): el is HTMLElement =>
  !!el?.matches?.(ctx.selector(parts.digitTrack))

export const setTrackTransform = (el: HTMLElement, counter: number) => {
  el.style.transform = getTrackTransform(counter)
}

/** Moves a track without animating; restores the exact declarative transition so renders stay in sync. */
export function snapTrack(el: HTMLElement, counter: number) {
  el.style.transition = "none"
  setTrackTransform(el, counter)
  void el.offsetHeight
  el.style.transition = DIGIT_TRACK_TRANSITION
}
