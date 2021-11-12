import type { ToastMachineContext as Ctx } from "./toast.types"

export const dom = {
  getDoc: (ctx: Ctx) => ctx.doc ?? document,
  getRootId: (ctx: Ctx) => `toast-${ctx.uid}`,
}
