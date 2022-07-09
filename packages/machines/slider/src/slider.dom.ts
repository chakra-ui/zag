import { dispatchInputValueEvent, getPointRelativeToNode, defineDomHelpers } from "@zag-js/dom-utils"
import { styles } from "./slider.style"
import type { MachineContext as Ctx, Point } from "./slider.types"
import { utils } from "./slider.utils"

export const dom = defineDomHelpers({
  ...styles,

  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `slider:${ctx.id}`,
  getThumbId: (ctx: Ctx) => ctx.ids?.thumb ?? `slider:${ctx.id}:thumb`,
  getControlId: (ctx: Ctx) => ctx.ids?.control ?? `slider:${ctx.id}:control`,
  getInputId: (ctx: Ctx) => `slider:${ctx.id}:input`,
  getOutputId: (ctx: Ctx) => ctx.ids?.output ?? `slider:${ctx.id}:output`,
  getTrackId: (ctx: Ctx) => ctx.ids?.track ?? `slider:${ctx.id}track`,
  getRangeId: (ctx: Ctx) => ctx.ids?.track ?? `slider:${ctx.id}:range`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `slider:${ctx.id}:label`,
  getMarkerId: (ctx: Ctx, value: number) => `slider:${ctx.id}:marker:${value}`,

  getRootEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getRootId(ctx)),
  getThumbEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getThumbId(ctx)),
  getControlEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getControlId(ctx)),
  getInputEl: (ctx: Ctx) => dom.getRootNode(ctx).getElementById(dom.getInputId(ctx)) as HTMLInputElement | null,

  getValueFromPoint(ctx: Ctx, point: Point): number | undefined {
    // get the slider root element
    const el = dom.getControlEl(ctx)
    if (!el) return

    // get the position/progress % of the point relative to the root's width/height
    const relativePoint = getPointRelativeToNode(point, el)
    const percentX = relativePoint.x / el.offsetWidth
    const percentY = relativePoint.y / el.offsetHeight

    // get the progress % depending on the orientation
    let percent: number

    if (ctx.isHorizontal) {
      percent = ctx.isRtl ? 1 - percentX : percentX
    } else {
      percent = 1 - percentY
    }

    return utils.fromPercent(ctx, percent)
  },

  dispatchChangeEvent(ctx: Ctx) {
    const input = dom.getInputEl(ctx)
    if (!input) return
    dispatchInputValueEvent(input, ctx.value)
  },
})
