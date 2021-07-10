export type Dict<T = any> = Record<string, T>

export type Booleanish = boolean | "true" | "false"

export type AnyFunction = (...args: any) => void

export type AnyEventHandler = (event: any) => void

export type MaybeFunction<T, Args extends any[] = []> =
  | T
  | ((...args: Args) => T)

export type EventKeys =
  | "ArrowDown"
  | "ArrowUp"
  | "ArrowLeft"
  | "ArrowRight"
  | "Enter"
  | "Space"
  | "Tab"
  | "Backspace"
  | "Control"
  | "Meta"
  | "Home"
  | "End"
  | "PageDown"
  | "PageUp"
  | "Delete"
  | "Escape"
  | " "
  | "Shift"
