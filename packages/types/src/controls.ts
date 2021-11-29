export type ControlProp =
  | { type: "boolean"; label?: string; defaultValue: boolean }
  | { type: "string"; label?: string; defaultValue: string; placeholder?: string }
  | { type: "select"; options: readonly string[]; defaultValue: string; label?: string }
  | { type: "multiselect"; options: readonly string[]; defaultValue: string[]; label?: string }
  | { type: "number"; label?: string; defaultValue: number; min?: number; max?: number }

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
    : never
}
