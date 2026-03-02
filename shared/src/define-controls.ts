import { deepExpand, deepGet, deepSet } from "./deep-get-set"

type TransformValueFn<T> = (value: T, values: Record<string, any>) => any

export type ControlProp =
  | { type: "boolean"; label?: string; defaultValue?: boolean; transformValue?: TransformValueFn<boolean> }
  | {
      type: "string"
      label?: string
      defaultValue?: string
      placeholder?: string
      transformValue?: TransformValueFn<string>
    }
  | {
      type: "select"
      options: readonly string[]
      defaultValue?: string
      label?: string
      transformValue?: TransformValueFn<string>
    }
  | {
      type: "multiselect"
      options: readonly string[]
      defaultValue?: string[]
      label?: string
      transformValue?: TransformValueFn<string[]>
    }
  | {
      type: "number"
      label?: string
      defaultValue?: number
      min?: number
      max?: number
      transformValue?: TransformValueFn<number>
    }
  | {
      type: "date"
      label?: string
      defaultValue?: string
      transformValue?: TransformValueFn<string>
    }

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
            : T[K] extends { type: "date" }
              ? string
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

function cloneValues<T>(values: T): T {
  try {
    return structuredClone(values) as T
  } catch {
    // Vue/Svelte reactivity wraps objects in Proxy, which structuredClone cannot clone.
    // Control values are JSON-serializable (primitives, arrays of strings).
    return JSON.parse(JSON.stringify(values)) as T
  }
}

export function getTransformedControlValues<T extends ControlRecord>(config: T, values: ControlValue<T>) {
  const result = cloneValues(values) as any
  for (const key of Object.keys(config)) {
    const control = config[key]
    if (!control) continue

    const value = deepGet(values as any, key)
    // @ts-expect-error - TODO: fix this
    const transformed = control.transformValue ? control.transformValue(value, values) : value
    deepSet(result, key, transformed)
  }
  return result
}
