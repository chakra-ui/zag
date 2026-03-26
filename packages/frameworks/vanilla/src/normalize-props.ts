import { createNormalizer } from "@zag-js/types"

export interface AttrMap {
  [key: string]: string
}

function toPascalCase(value: string) {
  return value.replace(/(^|-)([a-z0-9])/g, (_, __, char: string) => char.toUpperCase())
}

function appendScopePartClasses(props: any) {
  const scope = props["data-scope"]
  const part = props["data-part"]
  if (typeof part !== "string" || part.length === 0) return

  const classes = new Set<string>()
  const scopeClass = typeof scope === "string" && scope.length > 0 ? toPascalCase(scope) : undefined
  const partClass = toPascalCase(part)
  classes.add(partClass)
  if (scopeClass) classes.add(scopeClass)
  if (scopeClass) classes.add(`${scopeClass}${partClass}`)

  const existingClass = typeof props.className === "string" ? props.className : typeof props.class === "string" ? props.class : ""
  for (const item of existingClass.split(/\s+/)) {
    if (item) classes.add(item)
  }

  const classValue = Array.from(classes).join(" ")
  props.className = classValue
}

export const propMap: AttrMap = {
  onFocus: "onFocusin",
  onBlur: "onFocusout",
  onChange: "onInput",
  onDoubleClick: "onDblclick",
  htmlFor: "for",
  className: "class",
  defaultValue: "value",
  defaultChecked: "checked",
}

// SVG attributes that should preserve their case
const caseSensitiveSvgAttrs = new Set<string>(["viewBox", "preserveAspectRatio"])

export const toStyleString = (style: any) => {
  let string = ""
  for (let key in style) {
    const value = style[key]
    if (value === null || value === undefined) continue
    if (!key.startsWith("--")) key = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
    string += `${key}:${value};`
  }
  return string
}

export const normalizeProps = createNormalizer((props: any) => {
  appendScopePartClasses(props)

  return Object.entries(props).reduce<any>((acc, [key, value]) => {
    if (value === undefined) return acc

    if (key in propMap) {
      key = propMap[key]
    }

    if (key === "style" && typeof value === "object") {
      acc.style = toStyleString(value)
      return acc
    }

    // Preserve case for SVG attributes, lowercase everything else
    const normalizedKey = caseSensitiveSvgAttrs.has(key) ? key : key.toLowerCase()
    acc[normalizedKey] = value

    return acc
  }, {})
})
