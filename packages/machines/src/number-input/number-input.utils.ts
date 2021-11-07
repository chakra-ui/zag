import type { KeyboardEvent } from "react"
import { numericRange } from "../utils/number"
import { NumberInputMachineContext as Ctx } from "./number-input.types"

export const utils = {
  isValidNumericEvent: (ctx: Ctx, event: KeyboardEvent) => {
    if (event.key == null) return true
    const isModifierKey = event.ctrlKey || event.altKey || event.metaKey
    const isSingleCharacterKey = event.key.length === 1
    if (isModifierKey || !isSingleCharacterKey) return true
    return ctx.validateCharacter?.(event.key) ?? utils.isFloatingPoint(event.key)
  },
  isFloatingPoint: (v: string) => /^[Ee0-9+\-.]$/.test(v),
  sanitize: (ctx: Ctx, value: string) => {
    return value
      .split("")
      .filter(ctx.validateCharacter ?? utils.isFloatingPoint)
      .join("")
  },
  increment: (ctx: Ctx, step?: number) => {
    return numericRange(ctx).increment(step).clamp().getValue()
  },
  decrement: (ctx: Ctx, step?: number) => {
    return numericRange(ctx).decrement(step).clamp().getValue()
  },
  clamp: (ctx: Ctx) => {
    return numericRange(ctx).clamp().getValue()
  },
  parse: (ctx: Ctx, value: string) => {
    return ctx.parse?.(value) ?? value
  },
  format: (ctx: Ctx, value: string | number) => {
    const _val = value.toString()
    return ctx.format?.(_val) ?? _val
  },
}
