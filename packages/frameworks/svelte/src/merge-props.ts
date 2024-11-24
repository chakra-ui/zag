import { mergeProps as zagMergeProps } from "@zag-js/core"

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

const css = (style: CSSObject | string | undefined): string => {
  if (typeof style === "string") style = serialize(style)

  const mergedString = Object.entries(style as CSSObject)
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ")

  return mergedString
}

export function mergeProps(...args: Record<string, any>[]) {
  const merged = zagMergeProps(...args)

  if ("style" in merged) {
    merged.style = css(merged.style)
  }

  return merged
}
