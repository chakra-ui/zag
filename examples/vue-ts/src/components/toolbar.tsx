import { dataAttr } from "@zag-js/dom-utils"
import { defineComponent, h, ref } from "vue"
import { getToolbarStyles } from "../../../../shared/style"

type ToolbarProps = {
  controls: null | (() => JSX.Element)
  visualizer: null | JSX.Element
  count?: number
}

export const Toolbar = defineComponent({
  props: ["count", "controls", "visualizer"],
  setup(props) {
    const activeState = ref(props.controls === null ? 1 : 0)

    const style = getToolbarStyles(props.count ?? 1)

    return () => {
      return (
        <div class={style}>
          <nav>
            {props.controls !== null && (
              <button
                data-active={dataAttr(activeState.value === 0)}
                onClick={() => {
                  activeState.value = 0
                }}
              >
                Controls
              </button>
            )}
            <button
              data-active={dataAttr(activeState.value === 1)}
              onClick={() => {
                activeState.value = 1
              }}
            >
              Visualizer
            </button>
          </nav>
          <div>
            {props.controls !== null && (
              <div data-content data-active={dataAttr(activeState.value === 0)}>
                <props.controls />
              </div>
            )}
            <div data-content data-active={dataAttr(activeState.value === 1)}>
              {props.visualizer}
            </div>
          </div>
        </div>
      )
    }
  },
})
