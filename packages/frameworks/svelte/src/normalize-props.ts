import { createNormalizer } from "@zag-js/types"
import type {} from "svelte"

type PropTypes = Record<any, any> & {
  element: any
  style: any
}

export const normalizeProps = createNormalizer<any>((v) => v)
