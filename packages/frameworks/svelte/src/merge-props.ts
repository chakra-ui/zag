import { mergeProps as zagMergeProps } from "@zag-js/core"
import { toStyleString } from "./normalize-props"

const CSS_REGEX = /((?:--)?(?:\w+-?)+)\s*:\s*([\s\S]*)/

type CSSObject = Record<string, string>

const serialize = (style: string): CSSObject => {
  const res: Record<string, string> = {}
  const add = (declaration: string) => {
    const match = CSS_REGEX.exec(declaration)
    if (match) res[match[1]!] = match[2]!
  }
  let start = 0
  let depth = 0
  let quote = ""
  for (let i = 0; i < style.length; i++) {
    const char = style[i]
    if (char === "\\") i++
    else if (quote) {
      if (char === quote) quote = ""
    } else if (char === '"' || char === "'") quote = char
    else if (char === "(") depth++
    else if (char === ")" && depth) depth--
    else if (char === ";" && !depth) {
      add(style.slice(start, i))
      start = i + 1
    }
  }
  add(style.slice(start))
  return res
}

export function mergeProps(...args: Record<string | symbol, any>[]) {
  // Collect all class values (as-is, without conversion)
  // Svelte 5.15+ supports ClassValue types (string | array | object) and handles
  // the conversion internally using clsx. We collect them into an array and let
  // Svelte's native class handling resolve them at render time.
  // @see https://github.com/sveltejs/svelte/pull/14714
  const classNames: any[] = []

  for (const props of args) {
    if (!props) continue
    if ("class" in props && props.class != null) {
      classNames.push(props.class)
    }
  }

  const merged = zagMergeProps(...args)

  // Override class with our collected values
  // If only one value, return as-is; if multiple, return as array
  if (classNames.length > 0) {
    merged.class = classNames.length === 1 ? classNames[0] : classNames
  }

  if ("style" in merged) {
    if (typeof merged.style === "string") {
      merged.style = serialize(merged.style)
    }
    merged.style = toStyleString(merged.style)
  }

  return merged
}
