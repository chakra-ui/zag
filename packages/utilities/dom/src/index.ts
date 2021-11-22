type Booleanish = boolean | "true" | "false"

export const dataAttr = (guard: boolean | undefined) => {
  return (guard ? "" : undefined) as Booleanish
}

export const ariaAttr = (guard: boolean | undefined) => {
  return guard ? true : undefined
}

export * from "./keyboard-event"
export * from "./next-tick"
export * from "./query"
export * from "./sr-only"
export * from "./body-pointer-event"
export * from "./body-scroll-lock"
export * from "./computed-style"
export * from "./focus-event"
export * from "./focusable"
export * from "./listener"
export * from "./live-region"
export * from "@ui-machines/core/src/merge-props"
export * from "./mutation-observer"
export * from "./pointer-event"
export * from "./pointerlock"
export * from "./text-selection"
export * from "./nodelist"
export * from "./dispatch-event"
export * from "./scrollable"
