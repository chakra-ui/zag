import { createNormalizer, PropTypes, SplitArgs } from "@zag-js/types"
import type {} from "svelte"
import { getAttributesAndHandlers } from "./get-attributes-and-handlers"
import { normalizeAttributes } from "./normalize-attributes"
import { normalizeHandlers } from "./normalize-handlers"

export const normalizeProps = createNormalizer<PropTypes<SplitArgs>>((v) => {
  const { handlers, attributes } = getAttributesAndHandlers(v)
  const normalizedAttributes = normalizeAttributes(attributes)
  const normalizedHandlers = normalizeHandlers(handlers)

  return {
    handlers: normalizedHandlers,
    attributes: normalizedAttributes,
  }
})
