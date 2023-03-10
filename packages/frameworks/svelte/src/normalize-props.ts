import { createNormalizer } from "@zag-js/types"
import type {} from "svelte"
import { getAttributesAndHandlers } from "./get-attributes-and-handlers"
import { normalizeAttributes } from "./normalize-attributes"
import { normalizeHandlers } from "./normalize-handlers"

// TODO hoping to get element types from svelte
type IntrinsicAttributes = Record<"button" | "label" | "input" | "output" | "element" | "select" | "style", any>

type PropTypes = IntrinsicAttributes & {
  element: any
  style: any
}

export const normalizeProps = createNormalizer<PropTypes>((v) => {
  const { handlers, attributes } = getAttributesAndHandlers(v)
  const normalizedAttributes = normalizeAttributes(attributes)
  const normalizedHandlers = normalizeHandlers(handlers)

  return {
    handlers: normalizedHandlers,
    attributes: normalizedAttributes,
  }
})
