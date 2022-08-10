import { dataAttr } from "@zag-js/dom-utils"
import { defineComponent, ref } from "vue"

export const Toolbar = defineComponent({
  props: ["controls", "visualizer"],
  setup(props) {
    const activeState = ref(props.controls === null ? 1 : 0)

    return () => {
      return (
        <div class="toolbar">
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
