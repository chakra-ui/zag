import { cssVars } from "./middleware"

type Options = {
  measured: boolean
  strategy?: "absolute" | "fixed"
}

const UNMEASURED_FLOATING_STYLE = {
  position: "fixed",
  top: 0,
  left: 0,
  opacity: 0,
  transform: "translate3d(0, -200%, 0)",
} as const

export function getPlacementStyles(options: Options) {
  const { measured, strategy = "absolute" } = options

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
      transform: "rotate(45deg)",
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
