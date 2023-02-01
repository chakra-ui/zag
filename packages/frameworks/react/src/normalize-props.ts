import { createNormalizer } from "@zag-js/types"
import type { HTMLAttributes, CSSProperties } from "react"

type PropTypes = JSX.IntrinsicElements & {
  element: HTMLAttributes<HTMLElement>
  style: CSSProperties
}

export const normalizeProps = createNormalizer<PropTypes>((v) => v)
