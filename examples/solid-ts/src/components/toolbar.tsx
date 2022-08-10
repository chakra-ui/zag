import { dataAttr } from "@zag-js/dom-utils"
import { createSignal, JSX } from "solid-js"

type ToolbarProps = {
  controls: null | (() => JSX.Element)
  visualizer: null | JSX.Element
}

export function Toolbar(props: ToolbarProps) {
  const [active, setActive] = createSignal(props.controls === null ? 1 : 0)

  return (
    <div class="toolbar">
      <nav>
        {props.controls !== null && (
          <button data-active={dataAttr(active() === 0)} onClick={() => setActive(0)}>
            Controls
          </button>
        )}
        <button data-active={dataAttr(active() === 1)} onClick={() => setActive(1)}>
          Visualizer
        </button>
      </nav>
      <div>
        {props.controls !== null && (
          <div data-content data-active={dataAttr(active() === 0)}>
            <props.controls />
          </div>
        )}
        <div data-content data-active={dataAttr(active() === 1)}>
          {props.visualizer}
        </div>
      </div>
    </div>
  )
}
