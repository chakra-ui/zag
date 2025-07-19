import type { JsonNodePreviewOptions } from "./types"

export const defaultPreviewOptions: JsonNodePreviewOptions = {
  maxPreviewItems: 3,
  collapseStringsAfterLength: 30,
  groupArraysAfterLength: 100,
}

const withDefault = <T>(a: T, b: Partial<T>): T => {
  const res = { ...a }
  for (const key in b) {
    if (b[key as keyof T] !== undefined) res[key as keyof T] = b[key as keyof T] as never
  }
  return res
}

export const getPreviewOptions = (opts?: Partial<JsonNodePreviewOptions> | undefined): JsonNodePreviewOptions => {
  if (!opts) return defaultPreviewOptions
  return withDefault(defaultPreviewOptions, opts)
}
