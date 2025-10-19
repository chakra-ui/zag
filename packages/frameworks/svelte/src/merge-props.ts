import { createMergeProps } from "@zag-js/core"
import { toStyleString } from "./normalize-props"

const CSS_REGEX = /((?:--)?(?:\w+-?)+)\s*:\s*([^;]*)/g

type CSSObject = Record<string, string>

const serialize = (style: string): CSSObject => {
  const res: Record<string, string> = {}
  let match: RegExpExecArray | null
  while ((match = CSS_REGEX.exec(style))) {
    res[match[1]!] = match[2]!
  }
  return res
}

// Custom class merge function for Svelte
// Collect all class values (as-is, without conversion)
// Svelte 5.15+ supports ClassValue types (string | array | object) and handles
// the conversion internally using clsx. We collect them into an array and let
// Svelte's native class handling resolve them at render time.
// @see https://github.com/sveltejs/svelte/pull/14714
const svelteClassMerge = (existing: any, incoming: any) => {
  const classNames: any[] = []

  if (existing != null) classNames.push(existing)
  if (incoming != null) classNames.push(incoming)

  // If only one value, return as-is; if multiple, return as array
  return classNames.length === 1 ? classNames[0] : classNames
}

// Custom style merge function for Svelte
const svelteStyleMerge = (existing: any, incoming: any) => {
  // First handle the basic merging (string to object conversion if needed)
  let merged = existing
  if (existing && incoming) {
    if (typeof existing === "string" && typeof incoming === "string") {
      merged = `${existing};${incoming}`
    } else {
      if (typeof existing === "string") existing = serialize(existing)
      if (typeof incoming === "string") incoming = serialize(incoming)
      merged = Object.assign({}, existing ?? {}, incoming ?? {})
    }
  } else {
    merged = incoming ?? existing
  }

  // Convert final result to Svelte's expected format
  if (merged) {
    if (typeof merged === "string") {
      merged = serialize(merged)
    }
    merged = toStyleString(merged)
  }

  return merged
}

export const mergeProps = createMergeProps({
  classMerge: svelteClassMerge,
  styleMerge: svelteStyleMerge,
})
