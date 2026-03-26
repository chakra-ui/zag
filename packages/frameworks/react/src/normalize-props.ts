import { createNormalizer } from "@zag-js/types"
import type { HTMLAttributes, CSSProperties, JSX } from "react"

type WithoutRef<T> = Omit<T, "ref">

type ElementsWithoutRef = {
  [K in keyof JSX.IntrinsicElements]: WithoutRef<JSX.IntrinsicElements[K]>
}

export type PropTypes = ElementsWithoutRef & {
  element: WithoutRef<HTMLAttributes<HTMLElement>>
  style: CSSProperties
}

function toPascalCase(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("")
}

function getPartClassNames(props: Record<string, unknown>) {
  const scope = props["data-scope"]
  const part = props["data-part"]
  if (typeof part !== "string") return ""
  const partClass = toPascalCase(part)
  const classes = [partClass]
  if (typeof scope === "string") {
    const scopeClass = toPascalCase(scope)
    classes.push(scopeClass, `${scopeClass}${partClass}`)
  }
  return classes.join(" ")
}

export const normalizeProps = createNormalizer<PropTypes>((props) => {
  const partClassNames = getPartClassNames(props as Record<string, unknown>)
  if (!partClassNames) return props

  const existingClassName = (props as Record<string, unknown>).className
  return {
    ...props,
    className: typeof existingClassName === "string" ? `${existingClassName} ${partClassNames}` : partClassNames,
  }
})
