import type { KeyboardEvent } from "react"
import { rangy } from "@ui-machines/number-utils/rangy"
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
    return rangy(ctx).increment(step).clamp().value
  },
  decrement: (ctx: Ctx, step?: number) => {
    return rangy(ctx).decrement(step).clamp().value
  },
  clamp: (ctx: Ctx) => {
    return rangy(ctx).clamp().value
  },
  parse: (ctx: Ctx, value: string) => {
    return ctx.parse?.(value) ?? value
  },
  format: (ctx: Ctx, value: string | number) => {
    const _val = value.toString()
    return ctx.format?.(_val) ?? _val
  },
}
