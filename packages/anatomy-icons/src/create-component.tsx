import { createElement, type ElementType } from "react"
import { createPalette } from "./create-palette"

type SvgProps = React.SVGProps<SVGSVGElement>

type BaseProps = SvgProps & { accentColor: string }

type Props = SvgProps & { palette: string[] }

export function createComponent(Comp: React.ElementType<Props>) {
  const AnatomyIcon: React.FC<any> = ({ accentColor, ...rest }) => {
    const palette = createPalette(accentColor)
    return createElement(Comp, { palette, ...rest })
  }
  return AnatomyIcon as ElementType<BaseProps>
}
