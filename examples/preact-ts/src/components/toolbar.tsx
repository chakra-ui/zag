import { dataAttr } from "@zag-js/dom-query"
import { ComponentChildren } from "preact"
import { useState } from "preact/hooks"

interface ToolbarProps {
  controls?: null | (() => JSX.Element)
  children: ComponentChildren
  viz?: boolean
}

export function Toolbar(props: ToolbarProps) {
  const [active, setActive] = useState(props.viz ? 1 : !props.controls ? 1 : 0)

  return (
    <div className="toolbar">
      <nav>
        {props.controls && (
          <button data-active={dataAttr(active === 0)} onClick={() => setActive(0)}>
            Controls
          </button>
        )}
        <button data-active={dataAttr(active === 1)} onClick={() => setActive(1)}>
          Visualizer
        </button>
      </nav>
      <div>
        {props.controls && (
          <div data-content data-active={dataAttr(active === 0)}>
            <props.controls />
          </div>
        )}
        <div data-content data-active={dataAttr(active === 1)}>
          {props.children}
        </div>
      </div>
    </div>
  )
}
