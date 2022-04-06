import { injectGlobal } from "@emotion/css"
import * as Accordion from "@zag-js/accordion"
import { normalizeProps, useMachine, useSetup, PropTypes } from "@zag-js/vue"
import { computed, defineComponent, h, Fragment } from "vue"
import { accordionControls } from "../../../../shared/controls"
import { accordionData } from "../../../../shared/data"
import { accordionStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

injectGlobal(accordionStyle)

export default defineComponent({
  name: "Accordion",
  setup() {
    const controls = useControls(accordionControls)

    const [state, send] = useMachine(Accordion.machine, {
      context: controls.context,
    })

    const ref = useSetup({ send, id: "1" })

    const apiRef = computed(() => Accordion.connect<PropTypes>(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value

      return (
        <>
          <controls.ui />

          <div ref={ref} {...api.rootProps}>
            {accordionData.map((item) => (
              <div {...api.getItemProps({ value: item.id })}>
                <h3>
                  <button data-testid={`${item.id}:trigger`} {...api.getTriggerProps({ value: item.id })}>
                    {item.label}
                  </button>
                </h3>
                <div data-testid={`${item.id}:content`} {...api.getContentProps({ value: item.id })}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                  dolore magna aliqua.
                </div>
              </div>
            ))}
          </div>

          <StateVisualizer state={state} />
        </>
      )
    }
  },
})
