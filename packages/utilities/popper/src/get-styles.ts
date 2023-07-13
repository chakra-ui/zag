import type { Placement } from "@floating-ui/dom"
import { cssVars } from "./middleware"

export type GetPlacementStylesOptions = {
  placement?: Placement
}

const ARROW_FLOATING_STYLE = {
  bottom: "rotate(45deg)",
  left: "rotate(135deg)",
  top: "rotate(225deg)",
  right: "rotate(315deg)",
} as const

export function getPlacementStyles(options: GetPlacementStylesOptions) {
  const { placement = "bottom" } = options

  return {
    arrow: {
      position: "absolute",
      width: cssVars.arrowSize.reference,
      height: cssVars.arrowSize.reference,
      [cssVars.arrowSizeHalf.variable]: `calc(${cssVars.arrowSize.reference} / 2)`,
      [cssVars.arrowOffset.variable]: `calc(${cssVars.arrowSizeHalf.reference} * -1)`,
    } as const,

    arrowTip: {
      transform: ARROW_FLOATING_STYLE[placement.split("-")[0]],
      background: cssVars.arrowBg.reference,
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      position: "absolute",
      zIndex: "inherit",
    } as const,

    floating: {
      position: "absolute",
      minWidth: "max-content",
      top: "0px",
      left: "0px",
    } as const,
  }
}
