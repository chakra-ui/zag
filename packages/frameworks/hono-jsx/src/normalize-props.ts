import { createNormalizer } from "@zag-js/types"
import type { CSSProperties, JSX } from "hono/jsx"

type WithoutRef<T> = Omit<T, "ref">

type ElementsWithoutRef = {
  [K in keyof JSX.IntrinsicElements]: WithoutRef<JSX.IntrinsicElements[K]>
}

export type PropTypes = ElementsWithoutRef & {
  rect: any
  circle: any
  svg: any
  path: any
  element: WithoutRef<JSX.HTMLAttributes>
  style: CSSProperties
}

export const normalizeProps = createNormalizer<PropTypes>((v) => v)
