import * as popover from "@zag-js/popover"
import { popoverControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { useControls } from "../hooks/use-controls"
import { computed, defineComponent, h, Fragment, Teleport } from "vue"
import { StateVisualizer } from "../components/state-visualizer"

import { Toolbar } from "../components/toolbar"

export default defineComponent({
  name: "Popover",
  setup() {
    const controls = useControls(popoverControls)

    const [state, send] = useMachine(popover.machine({ id: "1" }), {
      context: controls.context,
    })

    const apiRef = computed(() => popover.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main>
            <div data-part="root">
              <button data-testid="button-before">Button :before</button>
              <button data-testid="popover-trigger" {...api.getTriggerProps()}>
                Click me
                <div {...api.getIndicatorProps()}>{">"}</div>
              </button>
              <Teleport to="body" disabled={!api.portalled}>
                <div {...api.getPositionerProps()}>
                  <div data-testid="popover-content" class="popover-content" {...api.getContentProps()}>
                    <div {...api.getArrowProps()}>
                      <div {...api.getArrowTipProps()} />
                    </div>
                    <div data-testid="popover-title" {...api.getTitleProps()}>
                      Popover Title
                    </div>
                    <div data-part="body" data-testid="popover-body">
                      <a>Non-focusable Link</a>
                      <a href="#" data-testid="focusable-link">
                        Focusable Link
                      </a>
                      <input data-testid="input" placeholder="input" />
                      <button data-testid="popover-close-button" {...api.getCloseTriggerProps()}>
                        X
                      </button>
                    </div>
                  </div>
                </div>
              </Teleport>
              <span data-testid="plain-text">I am just text</span>
              <button data-testid="button-after">Button :after</button>
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
