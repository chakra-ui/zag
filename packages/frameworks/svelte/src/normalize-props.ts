import { createNormalizer } from "@zag-js/types"
import { toStyleProps } from "./style"
import type { SvelteHTMLElements, HTMLAttributes } from "svelte/elements"

type Dict = Record<string, boolean | number | string | undefined>

const propMap: Record<string, string> = {
  className: "class",
  defaultChecked: "checked",
  defaultValue: "value",
  htmlFor: "for",
  onBlur: "onfocusout",
  onChange: "oninput",
  onFocus: "onfocusin",
  onDoubleClick: "ondblclick",
}

export type PropTypes = SvelteHTMLElements & {
  element: HTMLAttributes<HTMLElement>
  style?: HTMLAttributes<HTMLElement>["style"] | undefined
}

const preserveKeys = new Set<string>(
  "viewBox,className,preserveAspectRatio,fillRule,clipPath,clipRule,strokeWidth,strokeLinecap,strokeLinejoin,strokeDasharray,strokeDashoffset,strokeMiterlimit".split(
    ",",
  ),
)

function toSvelteProp(key: string) {
  if (key in propMap) return propMap[key]
  if (preserveKeys.has(key)) return key
  return key.toLowerCase()
}

export const normalizeProps = createNormalizer<PropTypes>((props) => {
  const normalized: Record<string | symbol, any> = {}

  for (const key in props) {
    const value = props[key]
    if (key === "style" && value && typeof value === "object") {
      Object.assign(normalized, toStyleProps(value))
      continue
    }
    normalized[toSvelteProp(key)] = value
  }

  return normalized
})

export { toStyleString } from "./style"
