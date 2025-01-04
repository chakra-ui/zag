import type { Booleanish } from "./types"

export const clamp = (value: number) => Math.max(0, Math.min(1, value))

export const wrap = <T>(v: T[], idx: number) => {
  return v.map((_, index) => v[(Math.max(idx, 0) + index) % v.length])
}

export const pipe =
  <T>(...fns: Array<(arg: T) => T>) =>
  (arg: T) =>
    fns.reduce((acc, fn) => fn(acc), arg)

export const noop = () => void 0

export const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null

export const MAX_Z_INDEX = 2147483647

export const dataAttr = (guard: boolean | undefined) => (guard ? "" : undefined) as Booleanish

export const ariaAttr = (guard: boolean | undefined) => (guard ? "true" : undefined)

export const sanitize = (str: string) =>
  str
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0)
      if (code > 0 && code < 128) return char
      if (code >= 128 && code <= 255) return `/x${code.toString(16)}`.replace("/", "\\")
      return ""
    })
    .join("")
    .trim()
