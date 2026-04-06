import type { Scope } from "@zag-js/core"
import { isHTMLElement } from "@zag-js/dom-query"
import { createRect, getElementRect, getWindowRect, type Rect } from "@zag-js/rect-utils"
import { pick } from "@zag-js/utils"
import { parts } from "./floating-panel.anatomy"

// ID generators — only for parts referenced by ARIA attributes
export const getTriggerId = (ctx: Scope) => ctx.ids?.trigger ?? `${ctx.id}:trigger`
export const getContentId = (ctx: Scope) => ctx.ids?.content ?? `${ctx.id}:content`
export const getTitleId = (ctx: Scope) => ctx.ids?.title ?? `${ctx.id}:title`
export const getHeaderId = (ctx: Scope) => ctx.ids?.header ?? `${ctx.id}:header`
export const getPositionerId = (ctx: Scope) => ctx.ids?.positioner ?? `${ctx.id}:positioner`

// Element lookups — use querySelector with merged data attributes
export const getTriggerEl = (ctx: Scope) => ctx.query(ctx.selector(parts.trigger))
export const getPositionerEl = (ctx: Scope) => ctx.query(ctx.selector(parts.positioner))
export const getContentEl = (ctx: Scope) => ctx.query(ctx.selector(parts.content))
export const getHeaderEl = (ctx: Scope) => ctx.query(ctx.selector(parts.header))

export const getBoundaryRect = (ctx: Scope, boundaryEl: HTMLElement | undefined | null, allowOverflow: boolean) => {
  let boundaryRect: Rect

  if (isHTMLElement(boundaryEl)) {
    boundaryRect = getElementRect(boundaryEl)
  } else {
    boundaryRect = getWindowRect(ctx.getWin())
  }

  if (allowOverflow) {
    boundaryRect = createRect({
      x: -boundaryRect.width, // empty(left)
      y: boundaryRect.minY,
      width: boundaryRect.width * 3, // empty(left) + win + empty(right)
      height: boundaryRect.height * 2, // win + empty(bottom)
    })
  }

  return pick(boundaryRect, ["x", "y", "width", "height"])
}
