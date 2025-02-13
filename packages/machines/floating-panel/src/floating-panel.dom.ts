import type { Scope } from "@zag-js/core"
import { isHTMLElement } from "@zag-js/dom-query"
import { createRect, getElementRect, getWindowRect, type Rect } from "@zag-js/rect-utils"
import { pick } from "@zag-js/utils"

export const getTriggerId = (ctx: Scope) => ctx.ids?.trigger ?? `float:${ctx.id}:trigger`
export const getPositionerId = (ctx: Scope) => ctx.ids?.positioner ?? `float:${ctx.id}:positioner`
export const getContentId = (ctx: Scope) => ctx.ids?.content ?? `float:${ctx.id}:content`
export const getTitleId = (ctx: Scope) => ctx.ids?.title ?? `float:${ctx.id}:title`
export const getHeaderId = (ctx: Scope) => ctx.ids?.header ?? `float:${ctx.id}:header`

export const getTriggerEl = (ctx: Scope) => ctx.getById(getTriggerId(ctx))
export const getPositionerEl = (ctx: Scope) => ctx.getById(getPositionerId(ctx))
export const getContentEl = (ctx: Scope) => ctx.getById(getContentId(ctx))
export const getHeaderEl = (ctx: Scope) => ctx.getById(getHeaderId(ctx))
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
