import type { MachineContext } from "./pin-input.types"

const REGEX = {
  numeric: /^[0-9]+$/,
  alphabetic: /^[A-Za-z]+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/i,
}

export function isValidType(ctx: MachineContext, value: string) {
  if (!ctx.type) return true
  return !!REGEX[ctx.type]?.test(value)
}

export function isValidValue(ctx: MachineContext, value: string) {
  if (!ctx.pattern) return isValidType(ctx, value)
  const regex = new RegExp(ctx.pattern, "g")
  return regex.test(value)
}
