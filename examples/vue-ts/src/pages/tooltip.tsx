import { injectGlobal } from "@emotion/css"
import * as Tooltip from "@zag-js/tooltip"
import { normalizeProps, useMachine, useSetup, PropTypes } from "@zag-js/vue"
import { computed, defineComponent, h, PropType, Fragment } from "vue"
import { tooltipStyles } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

injectGlobal(tooltipStyles)

export default defineComponent({
  name: "Tooltip",
  setup() {
    const [state, send] = useMachine(Tooltip.machine({ id: "tip-1" }))
    const ref = useSetup<HTMLButtonElement>({ send, id: "tip-1" })
    const apiRef = computed(() => Tooltip.connect<PropTypes>(state.value, send, normalizeProps))

    const [state2, send2] = useMachine(Tooltip.machine({ id: "tip-2" }))
    const ref2 = useSetup<HTMLButtonElement>({ send: send2, id: "tip-2" })
    const apiRef2 = computed(() => Tooltip.connect<PropTypes>(state2.value, send2, normalizeProps))

    return () => {
      const api = apiRef.value
      const api2 = apiRef2.value
      return (
        <>
          <main style={{ gap: "12px", flexDirection: "row" }}>
            <div>
              <button ref={ref} {...api.triggerProps}>
                Over me
              </button>
              {api.isOpen && (
                <div {...api.positionerProps}>
                  <div data-testid="tip-1-tooltip" {...api.contentProps}>
                    Tooltip
                  </div>
                </div>
              )}
            </div>

            <div>
              <button ref={ref2} {...api2.triggerProps}>
                Over me
              </button>
              {api2.isOpen && (
                <div {...api2.positionerProps}>
                  <div data-testid="tip-2-tooltip" {...api2.contentProps}>
                    Tooltip 2
                  </div>
                </div>
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
