import { createNormalizer } from "@zag-js/types"
import type { HTMLAttributes } from "react"

type PropTypes = JSX.IntrinsicElements & {
  element: HTMLAttributes<HTMLElement>
}

export const normalizeProps = createNormalizer<PropTypes>((v) => v)
