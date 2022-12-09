import * as hoverCard from "@zag-js/hover-card"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/vue"
import { computed, defineComponent, Teleport, h, Fragment } from "vue"
import { hoverCardControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "hover-card",
  setup() {
    const controls = useControls(hoverCardControls)

    const [state, send] = useMachine(hoverCard.machine({ id: "1" }), {
      context: controls.context,
    })

    const apiRef = computed(() => hoverCard.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main class="hover-card">
            <div style={{ display: "flex", gap: "50px" }}>
              <a href="https://twitter.com/zag_js" target="_blank" {...api.triggerProps}>
                Twitter
              </a>

              {api.isOpen && (
                <Teleport to="body">
                  <div {...api.positionerProps}>
                    <div {...api.contentProps}>
                      <div {...api.arrowProps}>
                        <div {...api.arrowTipProps} />
                      </div>
                      Twitter Preview
                      <a href="https://twitter.com/zag_js" target="_blank">
                        Twitter
                      </a>
                    </div>
                  </div>
                </Teleport>
              )}

              <div data-part="test-text">Test text</div>
            </div>
          </main>

          <Toolbar controls={controls.ui} visualizer={<StateVisualizer state={state} />} />
        </>
      )
    }
  },
})
