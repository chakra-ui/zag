import { roundToPx, wrap } from "@ui-machines/number-utils"
import { MachineContext as Ctx } from "./number-input.types"

type InputEl = HTMLInputElement | null
type ButtonEl = HTMLButtonElement | null

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,
  getWin: (ctx: Ctx) => dom.getDoc(ctx).defaultView ?? window,

  getInputId: (ctx: Ctx) => `number-input-${ctx.uid}-input`,
  getIncButtonId: (ctx: Ctx) => `number-input-${ctx.uid}-inc-btn`,
  getDecButtonId: (ctx: Ctx) => `number-input-${ctx.uid}-dec-btn`,
  getScrubberId: (ctx: Ctx) => `number-input-${ctx.uid}-scrubber`,
  getCursorId: (ctx: Ctx) => `number-input-${ctx.uid}-cursor`,
  getLabelId: (ctx: Ctx) => `number-input-${ctx.uid}-label`,
  getRootId: (ctx: Ctx) => `number-input-${ctx.uid}-root`,

  getInputEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getInputId(ctx)) as InputEl,
  getIncButtonEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getIncButtonId(ctx)) as ButtonEl,
  getDecButtonEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getDecButtonId(ctx)) as ButtonEl,
  getScrubberEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getScrubberId(ctx)),
  getCursorEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getCursorId(ctx)),

  getMousementValue(ctx: Ctx, event: MouseEvent) {
    const x = roundToPx(event.movementX)
    const y = roundToPx(event.movementY)

    let hint = x > 0 ? "increment" : x < 0 ? "decrement" : null

    if (ctx.isRtl && hint === "increment") hint = "decrement"
    if (ctx.isRtl && hint === "decrement") hint = "increment"

    const point = {
      x: ctx.cursorPoint!.x + x,
      y: ctx.cursorPoint!.y + y,
    }

    const win = dom.getWin(ctx)
    const width = win.innerWidth
    const half = roundToPx(7.5)
    point.x = wrap(point.x + half, width) - half

    return { hint, point }
  },
}
