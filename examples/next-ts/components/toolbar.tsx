import { dataAttr } from "@zag-js/dom-query"
import { ReactNode, useState } from "react"

type ToolbarProps = React.HTMLAttributes<HTMLDivElement> & {
  controls?: null | (() => JSX.Element)
  children: ReactNode
  viz?: boolean
}

export function Toolbar(props: ToolbarProps) {
  const { controls, children, viz, ...rest } = props
  const [active, setActive] = useState(viz ? 1 : !controls ? 1 : 0)

  return (
    <div className="toolbar" {...rest}>
      <nav>
        {controls && (
          <button data-active={dataAttr(active === 0)} onClick={() => setActive(0)}>
            Controls
          </button>
        )}
        <button data-active={dataAttr(active === 1)} onClick={() => setActive(1)}>
          Visualizer
        </button>
      </nav>
      <div>
        {controls && (
          <div data-content data-active={dataAttr(active === 0)}>
            {controls()}
          </div>
        )}
        <div data-content data-active={dataAttr(active === 1)}>
          {children}
        </div>
      </div>
    </div>
  )
}
