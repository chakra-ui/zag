import { NumberInputMachineContext as Ctx } from "./number-input.machine"

type InputEl = HTMLInputElement | null
type ButtonEl = HTMLButtonElement | null

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,
  getInputId: (ctx: Ctx) => `input-${ctx.uid}`,
  getIncButtonId: (ctx: Ctx) => `inc-btn-${ctx.uid}`,
  getDecButtonId: (ctx: Ctx) => `dec-btn-${ctx.uid}`,
  getInputEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getInputId(ctx)) as InputEl,
  getIncButtonEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getIncButtonId(ctx)) as ButtonEl,
  getDecButtonEl: (ctx: Ctx) => dom.getDoc(ctx).getElementById(dom.getDecButtonId(ctx)) as ButtonEl,
}
