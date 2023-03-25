import type { SplitArgs } from "./types"
import { createNormalizer, PropTypes } from "@zag-js/types"
import type { Dict } from "@zag-js/core/src/types"
import { getAttributesAndHandlers } from "./get-attributes-and-handlers"
import { normalizeAttributes } from "./normalize-attributes"
import { normalizeHandlers } from "./normalize-handlers"

export const normalizeProps = createNormalizer<PropTypes<SplitArgs<Dict>>>((v: Dict) => {
  const { handlers, attributes } = getAttributesAndHandlers(v)
  const normalizedAttributes = normalizeAttributes(attributes) as SplitArgs["attributes"]
  const normalizedHandlers = normalizeHandlers(handlers) as SplitArgs["handlers"]

  return {
    handlers: normalizedHandlers,
    attributes: normalizedAttributes,
  }
})
