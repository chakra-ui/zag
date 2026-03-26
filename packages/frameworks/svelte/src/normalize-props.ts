import { createNormalizer } from "@zag-js/types"
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

export function toStyleString(style: Record<string, number | string>) {
  let string = ""

  for (let key in style) {
    /**
     * Ignore null and undefined values.
     */
    const value = style[key]
    if (value === null || value === undefined) continue

    /**
     * Convert camelCase to kebab-case except for CSS custom properties.
     */
    if (!key.startsWith("--")) key = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)

    string += `${key}:${value};`
  }

  return string
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

function toSveltePropValue(key: string, value: Dict[string]) {
  if (key === "style" && typeof value === "object") return toStyleString(value)
  return value
}

function toPascalCase(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("")
}

function appendScopeClassName(props: Record<string, unknown>) {
  const dataScope = props["data-scope"] as string | undefined
  if (!dataScope || typeof dataScope !== "string") return

  const scopeClassName = toPascalCase(dataScope)
  const existing = props.className
  if (typeof existing === "string" && existing.length > 0) {
    if (!existing.split(/\s+/).includes(scopeClassName)) {
      props.className = `${existing} ${scopeClassName}`
    }
  } else {
    props.className = scopeClassName
  }
}

export const normalizeProps = createNormalizer<PropTypes>((props) => {
  appendScopeClassName(props)
  const dataPart = props["data-part"] as string | undefined
  const dataScope = props["data-scope"] as string | undefined

  if (dataPart && typeof dataPart === "string" && dataScope && typeof dataScope === "string") {
    const classParts = [`${toPascalCase(dataScope)}${toPascalCase(dataPart)}`]

    const existing = props.className
    if (typeof existing === "string" && existing.length > 0) {
      props.className = `${existing} ${classParts.join(" ")}`
    } else {
      props.className = classParts.join(" ")
    }
  }

  const normalized: Dict = {}

  for (const key in props) {
    normalized[toSvelteProp(key)] = toSveltePropValue(key, props[key])
  }

  return normalized
})
