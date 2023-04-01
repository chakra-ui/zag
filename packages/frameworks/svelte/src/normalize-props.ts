import type { SplitArgs } from "./types"
import { createNormalizer, PropTypes } from "@zag-js/types"
import type { Dict } from "@zag-js/core/src/types"
import { getAttributesAndHandlers } from "./get-attributes-and-handlers"
import { normalizeAttributes } from "./normalize-attributes"
import { normalizeHandlers } from "./normalize-handlers"

function camelCaseToDash(str: string) {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase()
}

function styleObjectToString(styleObject: Dict) {
  const transformed = Object.entries(styleObject)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${camelCaseToDash(key)}: ${value}${typeof value === "number" ? "px" : ""}`)
    .join("; ")
  return transformed
}

export const normalizeProps = createNormalizer<PropTypes<SplitArgs<Dict>>>((v: Dict) => {
  const { handlers, attributes, styles } = getAttributesAndHandlers(v)
  const normalizedAttributes = normalizeAttributes(attributes) as SplitArgs["attrs"]
  const normalizedHandlers = normalizeHandlers(handlers) as SplitArgs["rest"]["handlers"]
  const rest = {
    handlers: normalizedHandlers,
    styles: styleObjectToString(styles) as SplitArgs["rest"]["styles"],
  }

  return {
    rest,
    attrs: normalizedAttributes,
  }
})
