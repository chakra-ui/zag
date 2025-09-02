import { deepExpand } from "./deep-get-set"

export type ControlProp =
  | { type: "boolean"; label?: string; defaultValue?: boolean }
  | { type: "string"; label?: string; defaultValue?: string; placeholder?: string }
  | { type: "select"; options: readonly string[]; defaultValue?: string; label?: string }
  | { type: "multiselect"; options: readonly string[]; defaultValue?: string[]; label?: string }
  | { type: "number"; label?: string; defaultValue?: number; min?: number; max?: number }
  | { type: "array"; label?: string; defaultValue?: any[]; placeholder?: string; elementType?: "string" | "number" }

export type ControlRecord = Record<string, ControlProp>

export type ControlValue<T extends ControlRecord> = {
  [K in keyof T]: T[K] extends { type: "boolean" }
    ? boolean
    : T[K] extends { type: "string" }
      ? string
      : T[K] extends { type: "select" }
        ? T[K]["options"][number]
        : T[K] extends { type: "multiselect" }
          ? T[K]["options"][number][]
          : T[K] extends { type: "number" }
            ? number
            : T[K] extends { type: "array" }
              ? any[]
              : never
}

export function defineControls<T extends ControlRecord>(config: T) {
  return config
}

export function getControlDefaults<T extends ControlRecord>(obj: T) {
  const result = Object.keys(obj).reduce(
    (acc, key) => ({
      ...acc,
      [key]: obj[key].defaultValue,
    }),
    {} as ControlValue<T>,
  )

  return deepExpand(result)
}
