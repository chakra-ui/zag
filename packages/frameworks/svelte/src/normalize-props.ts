import { createNormalizer } from "@zag-js/types"
import type {} from "svelte"

// TODO hoping to get element types from svelte
type IntrinsicAttributes = Record<"button" | "label" | "input" | "output" | "element" | "select" | "style", any>

type PropTypes = IntrinsicAttributes & {
  element: any
  style: any
}

export const normalizeProps = createNormalizer<PropTypes>((v) => v)
