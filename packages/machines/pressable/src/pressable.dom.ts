import type { PressableMachineContext as Ctx } from "./pressable.types"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,
  getRootId: (ctx: Ctx) => `pressable-${ctx.uid}`,
}
