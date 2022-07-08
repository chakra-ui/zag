import { createNormalizer } from "@zag-js/types"
import type { HTMLAttributes } from "react"

type PropTypes = {
  button: JSX.IntrinsicElements["button"]
  label: JSX.IntrinsicElements["label"]
  input: JSX.IntrinsicElements["input"]
  output: JSX.IntrinsicElements["output"]
  element: HTMLAttributes<HTMLElement>
}

export const normalizeProps = createNormalizer<PropTypes>((v) => v)
