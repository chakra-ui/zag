import { createNormalizer, JSX } from "@zag-js/types"
import type {} from "svelte"
import { getAttributesAndHandlers } from "./get-attributes-and-handlers"
import { normalizeAttributes } from "./normalize-attributes"
import { normalizeHandlers } from "./normalize-handlers"

type PropTypes = JSX.IntrinsicElements & {
  element: JSX.HTMLAttributes<any>
  style: JSX.CSSProperties
  isSvelte: boolean
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
