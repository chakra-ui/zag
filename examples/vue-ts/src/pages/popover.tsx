import { injectGlobal } from "@emotion/css"
import * as popover from "@zag-js/popover"
import { popoverStyle, popoverControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { defineComponent } from "@vue/runtime-core"
import { useControls } from "../hooks/use-controls"
import { computed, h, Fragment, Teleport } from "vue"
import { StateVisualizer } from "../components/state-visualizer"

import { Toolbar } from "../components/toolbar"

injectGlobal(popoverStyle)

export default defineComponent({
  name: "Popover",
  setup() {
    const controls = useControls(popoverControls)

    const [state, send] = useMachine(popover.machine({ id: "popover" }), {
      context: controls.context,
    })

    const apiRef = computed(() => popover.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      const Wrapper = api.portalled ? Teleport : Fragment

      return (
        <>
          <main>
            <div data-part="root">
              <button data-testid="button-before">Button :before</button>
              <button data-testid="popover-trigger" {...api.triggerProps}>
                Click me
              </button>
              <Wrapper to="body">
                <div {...api.positionerProps}>
                  <div data-testid="popover-content" {...api.contentProps}>
                    <div {...api.arrowProps}>
                      <div {...api.innerArrowProps} />
                    </div>
                    <div data-testid="popover-title" {...api.titleProps}>
                      Popover Title
                    </div>
                    <div data-part="body" data-testid="popover-body">
                      <a>Non-focusable Link</a>
                      <a href="#" data-testid="focusable-link">
                        Focusable Link
                      </a>
                      <input data-testid="input" placeholder="input" />
                      <button data-testid="popover-close-button" {...api.closeButtonProps}>
                        X
                      </button>
                    </div>
                  </div>
                </div>
              </Wrapper>
              <span data-testid="plain-text">I am just text</span>
              <button data-testid="button-after">Button :after</button>
            </div>
          </main>

          <Toolbar controls={controls.ui} visualizer={<StateVisualizer state={state} />} />
        </>
      )
    }
  },
})
