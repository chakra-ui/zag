import type { KeyboardEvent } from "react"
import { range as createRange, clamp, increment, decrement } from "tiny-num"
import { NumberInputMachineContext as Ctx } from "."

export const utils = {
  isValidNumericEvent: (event: KeyboardEvent) => {
    if (event.key == null) return true

    const isModifierKey = event.ctrlKey || event.altKey || event.metaKey
    if (isModifierKey) return true

    const isSingleCharacterKey = event.key.length === 1
    if (!isSingleCharacterKey) return true

    return utils.isFloatingPoint(event.key)
  },
  isFloatingPoint: (v: string) => {
    return /^[Ee0-9+\-.]$/.test(v)
  },
  sanitize: (value: string) => {
    return value.split("").filter(utils.isFloatingPoint).join("")
  },
  increment: (ctx: Ctx, step?: number) => {
    const range = createRange(ctx)
    return clamp(increment(range.value, step ?? ctx.step), ctx).toString()
  },
  decrement: (ctx: Ctx, step?: number) => {
    const range = createRange(ctx)
    return clamp(decrement(range.value, step ?? ctx.step), ctx).toString()
  },
  clamp: (ctx: Ctx) => {
    const range = createRange(ctx)
    return clamp(range.value, ctx).toString()
  },
}
