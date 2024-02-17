import type { Booleanish } from "./types"

export const dataAttr = (guard: boolean | undefined) => (guard ? "" : undefined) as Booleanish
export const ariaAttr = (guard: boolean | undefined) => (guard ? "true" : undefined)
