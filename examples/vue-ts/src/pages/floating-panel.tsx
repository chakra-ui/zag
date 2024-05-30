import * as floatingPanel from "@zag-js/floating-panel"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { floatingPanelControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { ArrowDownLeft, Maximize2, Minus, XIcon } from "lucide-vue-next"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "floatingPanel",
  setup() {
    const controls = useControls(floatingPanelControls)

    const [state, send] = useMachine(floatingPanel.machine({ id: "1" }), {
      context: controls.context,
    })

    const apiRef = computed(() => floatingPanel.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="floatingPanel">
            <div>
              <button {...api.getTriggerProps()}>Toggle Panel</button>
              <div {...api.getPositionerProps()}>
                <div {...api.getContentProps()}>
                  <div {...api.getDragTriggerProps()}>
                    <div {...api.getHeaderProps()}>
                      <p {...api.getTitleProps()}>Floating Panel</p>
                      <div data-scope="floating-panel" data-part="trigger-group">
                        <button {...api.getMinimizeTriggerProps()}>
                          <Minus />
                        </button>
                        <button {...api.getMaximizeTriggerProps()}>
                          <Maximize2 />
                        </button>
                        <button {...api.getRestoreTriggerProps()}>
                          <ArrowDownLeft />
                        </button>
                        <button {...api.getCloseTriggerProps()}>
                          <XIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div {...api.getBodyProps()}>
                    <p>Some content</p>
                  </div>

                  <div {...api.getResizeTriggerProps({ axis: "n" })} />
                  <div {...api.getResizeTriggerProps({ axis: "e" })} />
                  <div {...api.getResizeTriggerProps({ axis: "w" })} />
                  <div {...api.getResizeTriggerProps({ axis: "s" })} />
                  <div {...api.getResizeTriggerProps({ axis: "ne" })} />
                  <div {...api.getResizeTriggerProps({ axis: "se" })} />
                  <div {...api.getResizeTriggerProps({ axis: "sw" })} />
                  <div {...api.getResizeTriggerProps({ axis: "nw" })} />
                </div>
              </div>
            </div>
          </main>

          <Toolbar controls={controls.ui}>
            <StateVisualizer state={state} />
          </Toolbar>
        </>
      )
    }
  },
})
