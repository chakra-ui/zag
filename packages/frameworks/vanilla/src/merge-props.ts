import { mergeProps as zagMergeProps } from "@zag-js/core"
import { toStyleString } from "./normalize-props"

export function mergeProps(...args: Record<string | symbol, any>[]) {
  const merged = zagMergeProps(...args)

  if ("style" in merged && typeof merged.style === "object") {
    merged.style = toStyleString(merged.style)
  }

  return merged
}
