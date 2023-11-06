import type { Style } from "@zag-js/types"
import type { MachineContext as Ctx } from "./collapsible.types"

function getContentStyle(ctx: Ctx): Style {
  if (!ctx.isAnimated) {
    return {}
  }

  if (ctx.closing) {
    return {
      overflow: "hidden",
      animation: `${ctx.collapseAnimationName} ${ctx.animationDuration}ms ease-out`,
    }
  } else if (ctx.opening || !ctx.open) {
    return {
      overflow: "hidden",
      animation: `${ctx.expandAnimationName} ${ctx.animationDuration}ms ease-out`,
    }
  }

  return {}
}

export const styleGetterFns = {
  getContentStyle,
}
