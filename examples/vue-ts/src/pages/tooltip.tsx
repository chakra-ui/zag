import { injectGlobal } from "@emotion/css"
import * as Tooltip from "@zag-js/tooltip"
import { normalizeProps, useMachine, useSetup } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment, Teleport } from "vue"
import { tooltipStyles } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

injectGlobal(tooltipStyles)

export default defineComponent({
  name: "Tooltip",
  setup() {
    const [state, send] = useMachine(Tooltip.machine({ id: "tip-1" }))
    const ref = useSetup<HTMLButtonElement>({ send, id: "tip-1" })
    const apiRef = computed(() => Tooltip.connect(state.value, send, normalizeProps))

    const [state2, send2] = useMachine(Tooltip.machine({ id: "tip-2" }))
    const ref2 = useSetup<HTMLButtonElement>({ send: send2, id: "tip-2" })
    const apiRef2 = computed(() => Tooltip.connect(state2.value, send2, normalizeProps))

    return () => {
      const api = apiRef.value
      const api2 = apiRef2.value
      return (
        <>
          <main style={{ gap: "12px", flexDirection: "row" }}>
            <div class="root">
              <button ref={ref} {...api.triggerProps}>
                Over me
              </button>
              {api.isOpen && (
                <Teleport to="body">
                  <div {...api.positionerProps}>
                    <div data-testid="tip-1-tooltip" {...api.contentProps}>
                      Tooltip
                    </div>
                  </div>
                </Teleport>
              )}

              <button ref={ref2} {...api2.triggerProps}>
                Over me
              </button>
              {api2.isOpen && (
                <Teleport to="body">
                  <div {...api2.positionerProps}>
                    <div data-testid="tip-2-tooltip" {...api2.contentProps}>
                      Tooltip 2
                    </div>
                  </div>
                </Teleport>
              )}
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
