import { injectGlobal } from "@emotion/css"
import * as accordion from "@zag-js/accordion"
import { normalizeProps, useMachine, useSetup, PropTypes } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { accordionControls } from "../../../../shared/controls"
import { accordionData } from "../../../../shared/data"
import { accordionStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"
import { useId } from "../hooks/use-id"

injectGlobal(accordionStyle)

export default defineComponent({
  name: "Accordion",
  setup() {
    const controls = useControls(accordionControls)

    const [state, send] = useMachine(accordion.machine, {
      context: controls.context,
    })

    const ref = useSetup({ send, id: useId() })

    const apiRef = computed(() => accordion.connect<PropTypes>(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <main>
            <div ref={ref} {...api.rootProps}>
              {accordionData.map((item) => (
                <div {...api.getItemProps({ value: item.id })}>
                  <h3>
                    <button data-testid={`${item.id}:trigger`} {...api.getTriggerProps({ value: item.id })}>
                      {item.label}
                    </button>
                  </h3>
                  <div data-testid={`${item.id}:content`} {...api.getContentProps({ value: item.id })}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua.
                  </div>
                </div>
              ))}
            </div>
          </main>

          <Toolbar controls={controls.ui} visualizer={<StateVisualizer state={state} />} />
        </>
      )
    }
  },
})
