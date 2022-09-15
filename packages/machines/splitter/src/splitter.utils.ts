import { dom } from "./splitter.dom"
import type { MachineContext as Ctx } from "./splitter.types"

type VAI<T> = T extends Array<infer A> ? A : T

export const utils = {
  getValueAtIndex<T extends Ctx[keyof Ctx]>(property: T, index: number): VAI<T> {
    return Array.isArray(property) ? property[index] : (property as any)
  },

  computePaneWidth(ctx: Ctx, index: number) {
    const el = dom.getPaneEl(ctx, index)
    if (!el) return 0
    return el.offsetWidth
  },

  getPaneValue(ctx: Ctx, index: number) {
    const value = utils.getValueAtIndex(ctx.values, index)
    if (typeof value !== "undefined") return value
    return utils.computePaneWidth(ctx, index)
  },
}
