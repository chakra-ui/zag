import { dispatchInputValueEvent, getPointRelativeToNode } from "@zag-js/dom-utils"
import { styles } from "./slider.style"
import type { MachineContext as Ctx, Point } from "./slider.types"
import { utils } from "./slider.utils"

export const dom = {
  ...styles,
  getDoc: (ctx: Ctx) => ctx.doc ?? document,
  getRootNode: (ctx: Ctx) => ctx.rootNode ?? dom.getDoc(ctx),

  getRootId: (ctx: Ctx) => ctx.ids?.root ?? `slider:${ctx.uid}`,
  getThumbId: (ctx: Ctx) => ctx.ids?.thumb ?? `slider:${ctx.uid}:thumb`,
  getControlId: (ctx: Ctx) => ctx.ids?.control ?? `slider:${ctx.uid}:control`,
  getInputId: (ctx: Ctx) => `slider:${ctx.uid}:input`,
  getOutputId: (ctx: Ctx) => ctx.ids?.output ?? `slider:${ctx.uid}:output`,
  getTrackId: (ctx: Ctx) => ctx.ids?.track ?? `slider:${ctx.uid}track`,
  getRangeId: (ctx: Ctx) => ctx.ids?.track ?? `slider:${ctx.uid}:range`,
  getLabelId: (ctx: Ctx) => ctx.ids?.label ?? `slider:${ctx.uid}:label`,
  getMarkerId: (ctx: Ctx, value: number) => `slider:${ctx.uid}:marker:${value}`,

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
}
