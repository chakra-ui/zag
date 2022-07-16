import { injectGlobal } from "@emotion/css"
import * as Tooltip from "@zag-js/tooltip"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment, Teleport } from "vue"
import { tooltipStyles } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

injectGlobal(tooltipStyles)

export default defineComponent({
  name: "Tooltip",
  setup() {
    const id = "tip-1"
    const id2 = "tip-2"
    const [state, send] = useMachine(Tooltip.machine({ id }))
    const apiRef = computed(() => Tooltip.connect(state.value, send, normalizeProps))

    const [state2, send2] = useMachine(Tooltip.machine({ id: id2 }))
    const apiRef2 = computed(() => Tooltip.connect(state2.value, send2, normalizeProps))

    return () => {
      const api = apiRef.value
      const api2 = apiRef2.value
      return (
        <>
          <main style={{ gap: "12px", flexDirection: "row" }}>
            <div class="root">
              <button data-testid={`${id}-trigger`} {...api.triggerProps}>
                Over me
              </button>
              {api.isOpen && (
                <Teleport to="body">
                  <div {...api.positionerProps}>
                    <div data-testid={`${id}-tooltip`} {...api.contentProps}>
                      Tooltip
                    </div>
                  </div>
                </Teleport>
              )}
              <button data-testid={`${id2}-trigger`} {...api2.triggerProps}>
                Over me
              </button>
              {api2.isOpen && (
                <Teleport to="body">
                  <div {...api2.positionerProps}>
                    <div data-testid={`${id2}-tooltip`} {...api2.contentProps}>
                      Tooltip 2
                    </div>
                  </div>
                </Teleport>
              )}{" "}
              data-testid={`${id2}-tooltip`}
            </div>
          </main>

          <Toolbar
            controls={null}
            count={2}
            visualizer={
              <>
                <StateVisualizer state={state} />
                <StateVisualizer state={state2} />
              </>
            }
          />
        </>
      )
    }
  },
})
