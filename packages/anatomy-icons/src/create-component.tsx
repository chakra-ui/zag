import { createElement } from "react"
import { createPalette } from "./create-palette"

type SvgProps = React.SVGProps<SVGSVGElement>

type BaseProps = SvgProps & { accentColor: string }

type Props = SvgProps & { palette: string[] }

export function createComponent(Comp: React.ElementType<Props>): React.FC<BaseProps> {
  const AnatomyIcon: React.FC<any> = ({ accentColor, ...rest }) => {
    const palette = createPalette(accentColor)
    return createElement(Comp, { palette, ...rest })
  }
  return AnatomyIcon as React.FC<BaseProps>
}
