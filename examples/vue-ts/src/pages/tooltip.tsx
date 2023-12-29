import * as Tooltip from "@zag-js/tooltip"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent, Teleport } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default defineComponent({
  name: "Tooltip",
  setup() {
    const [state, send] = useMachine(Tooltip.machine({ id: "1" }))
    const apiRef = computed(() => Tooltip.connect(state.value, send, normalizeProps))

    const [state2, send2] = useMachine(Tooltip.machine({ id: "2" }))
    const apiRef2 = computed(() => Tooltip.connect(state2.value, send2, normalizeProps))

    return () => {
      const api = apiRef.value
      const api2 = apiRef2.value
      return (
        <>
          <main class="tooltip" style={{ gap: "12px", flexDirection: "row" }}>
            <div class="root">
              <button {...api.triggerProps}>Hover me</button>
              {api.isOpen && (
                <Teleport to="body">
                  <div {...api.positionerProps}>
                    <div class="tooltip-content" data-testid="tip-1-tooltip" {...api.contentProps}>
                      Tooltip
                    </div>
                  </div>
                </Teleport>
              )}

              <button {...api2.triggerProps}>Over me</button>
              {api2.isOpen && (
                <Teleport to="body">
                  <div {...api2.positionerProps}>
                    <div class="tooltip-content" data-testid="tip-2-tooltip" {...api2.contentProps}>
                      Tooltip 2
                    </div>
                  </div>
                </Teleport>
              )}
            </div>
          </main>

          <Toolbar>
            <StateVisualizer state={state} />
            <StateVisualizer state={state2} />
          </Toolbar>
        </>
      )
    }
  },
})
