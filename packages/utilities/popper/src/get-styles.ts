import { Placement } from "@floating-ui/dom"
import { cssVars } from "./middleware"

type Options = {
  measured: boolean
  strategy?: "absolute" | "fixed"
  placement?: Placement
}

const UNMEASURED_FLOATING_STYLE = {
  position: "fixed",
  top: 0,
  left: 0,
  opacity: 0,
  transform: "translate3d(0, -200%, 0)",
  pointerEvents: "none",
} as const

const ARROW_FLOATING_STYLE = {
  bottom: "rotate(45deg)",
  left: "rotate(135deg)",
  top: "rotate(225deg)",
  right: "rotate(315deg)",
} as const

export function getPlacementStyles(options: Options) {
  const { measured, strategy = "absolute", placement = "bottom" } = options

  return {
    arrow: {
      position: "absolute",
      width: cssVars.arrowSize.reference,
      height: cssVars.arrowSize.reference,
      [cssVars.arrowSizeHalf.variable]: `calc(${cssVars.arrowSize.reference} / 2)`,
      [cssVars.arrowOffset.variable]: `calc(${cssVars.arrowSizeHalf.reference} * -1)`,
      opacity: !measured ? 0 : undefined,
    } as const,

    innerArrow: {
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
      position: strategy,
      minWidth: "max-content",
      ...(!measured && UNMEASURED_FLOATING_STYLE),
    } as const,
  }
}
